import random
import string
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.complaint import Complaint, ComplaintUpdate
from ..models.user import User
from ..models.department import Department
from .. import db
from ..services import groq_service, claude_service, notification_service

complaints_bp = Blueprint('complaints', __name__)

def generate_complaint_number():
    prefix = 'CC'
    year = datetime.now().year
    random_part = ''.join(random.choices(string.digits, k=6))
    return f"{prefix}{year}{random_part}"

def get_department_id(dept_name: str):
    dept = Department.query.filter(
        Department.name.ilike(f'%{dept_name}%')
    ).first()
    return dept.id if dept else None


@complaints_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_complaint():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data.get('title') or not data.get('description'):
        return jsonify({'success': False, 'message': 'Title and description are required'}), 400
    
    # Step 1: Groq AI classification (fast)
    classification = groq_service.classify_complaint(data['title'], data['description'])
    
    # Step 2: Claude deep analysis
    claude_analysis = claude_service.analyze_complaint_deeply(
        data['title'],
        data['description'],
        classification.get('category', 'Other'),
        classification.get('priority', 'medium')
    )
    
    # Find department
    dept_name = classification.get('department', 'Municipal Services')
    dept_id = get_department_id(dept_name)
    
    complaint = Complaint(
        complaint_number=generate_complaint_number(),
        user_id=user_id,
        department_id=dept_id,
        title=data['title'],
        description=data['description'],
        location=data.get('location', ''),
        voice_transcript=data.get('voice_transcript', ''),
        
        # AI enriched
        category=classification.get('category', data.get('category', 'Other')),
        sub_category=classification.get('sub_category', ''),
        priority=classification.get('priority', 'medium'),
        ai_department=dept_name,
        ai_category=classification.get('category', 'Other'),
        ai_summary=claude_analysis.get('summary', ''),
        sentiment_score=claude_analysis.get('sentiment_score', 0.0),
        urgency_justification=claude_analysis.get('urgency_justification', ''),
    )
    
    db.session.add(complaint)
    db.session.flush()
    
    # Add initial update
    initial_update = ComplaintUpdate(
        complaint_id=complaint.id,
        updated_by=user_id,
        message=f"Complaint submitted and AI-classified as {complaint.category} with {complaint.priority} priority.",
        status_change='submitted'
    )
    db.session.add(initial_update)
    db.session.commit()
    
    # Notify user
    notification_service.notify_complaint_submitted(user_id, complaint.complaint_number, complaint.id)
    
    # Notify admins if urgent
    if complaint.priority == 'urgent':
        admins = User.query.filter_by(role='admin').all()
        notification_service.notify_urgent_complaint(
            [a.id for a in admins], complaint.complaint_number, complaint.id
        )
    
    return jsonify({
        'success': True,
        'message': 'Complaint submitted and analyzed by AI',
        'complaint': complaint.to_dict(),
        'ai_insights': {
            'classification': classification,
            'analysis': claude_analysis
        }
    }), 201


@complaints_bp.route('/my', methods=['GET'])
@jwt_required()
def my_complaints():
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status_filter = request.args.get('status')
    
    query = Complaint.query.filter_by(user_id=user_id)
    if status_filter:
        query = query.filter_by(status=status_filter)
    
    complaints = query.order_by(Complaint.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'complaints': [c.to_dict() for c in complaints.items],
        'total': complaints.total,
        'pages': complaints.pages,
        'current_page': page
    })


@complaints_bp.route('/all', methods=['GET'])
@jwt_required()
def all_complaints():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'department_head']:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status_filter = request.args.get('status')
    priority_filter = request.args.get('priority')
    
    query = Complaint.query
    
    if user.role == 'department_head' and user.department_id:
        query = query.filter_by(department_id=user.department_id)
    if status_filter:
        query = query.filter_by(status=status_filter)
    if priority_filter:
        query = query.filter_by(priority=priority_filter)
    
    complaints = query.order_by(
        Complaint.priority.desc(),
        Complaint.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'success': True,
        'complaints': [c.to_dict() for c in complaints.items],
        'total': complaints.total,
        'pages': complaints.pages,
        'current_page': page
    })


@complaints_bp.route('/<int:complaint_id>', methods=['GET'])
@jwt_required()
def get_complaint(complaint_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    complaint = Complaint.query.get_or_404(complaint_id)
    
    if user.role == 'citizen' and complaint.user_id != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    return jsonify({'success': True, 'complaint': complaint.to_dict(include_updates=True)})


@complaints_bp.route('/<int:complaint_id>/status', methods=['PATCH'])
@jwt_required()
def update_status(complaint_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'department_head']:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    if not data.get('status') or not data.get('message'):
        return jsonify({'success': False, 'message': 'Status and message are required'}), 400
    
    valid_statuses = ['submitted', 'under_review', 'in_progress', 'resolved', 'rejected']
    if data['status'] not in valid_statuses:
        return jsonify({'success': False, 'message': 'Invalid status'}), 400
    
    complaint = Complaint.query.get_or_404(complaint_id)
    old_status = complaint.status
    complaint.status = data['status']
    
    if data['status'] == 'resolved':
        complaint.resolved_at = datetime.utcnow()
    
    update = ComplaintUpdate(
        complaint_id=complaint_id,
        updated_by=user_id,
        message=data['message'],
        status_change=data['status'],
        is_internal=data.get('is_internal', False)
    )
    db.session.add(update)
    db.session.commit()
    
    # Notify citizen
    notification_service.notify_status_update(
        complaint.user_id, complaint.complaint_number, data['status'], complaint_id
    )
    
    return jsonify({
        'success': True,
        'message': 'Status updated',
        'complaint': complaint.to_dict()
    })


@complaints_bp.route('/voice-submit', methods=['POST'])
@jwt_required()
def voice_submit():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    transcript = data.get('transcript', '')
    language = data.get('language', 'en')
    
    if not transcript:
        return jsonify({'success': False, 'message': 'Transcript is required'}), 400
    
    # Extract structured complaint from voice
    structured = groq_service.voice_to_complaint(transcript, language)
    structured['voice_transcript'] = transcript
    
    return jsonify({
        'success': True,
        'structured_complaint': structured,
        'message': 'Voice processed successfully'
    })
