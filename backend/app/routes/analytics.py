from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, cast, Date
from ..models.complaint import Complaint
from ..models.user import User
from ..models.department import Department
from .. import db
from ..services import claude_service

analytics_bp = Blueprint('analytics', __name__)

def admin_required(user_id):
    user = User.query.get(user_id)
    return user and user.role in ['admin', 'department_head']


@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
def overview():
    user_id = int(get_jwt_identity())
    if not admin_required(user_id):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    total = Complaint.query.count()
    resolved = Complaint.query.filter_by(status='resolved').count()
    pending = Complaint.query.filter(Complaint.status.in_(['submitted', 'under_review', 'in_progress'])).count()
    urgent = Complaint.query.filter_by(priority='urgent').count()
    high = Complaint.query.filter_by(priority='high').count()
    
    # Average resolution time
    resolved_complaints = Complaint.query.filter(
        Complaint.status == 'resolved',
        Complaint.resolved_at.isnot(None)
    ).all()
    
    avg_days = 0
    if resolved_complaints:
        total_days = sum(
            (c.resolved_at - c.created_at).days for c in resolved_complaints
        )
        avg_days = round(total_days / len(resolved_complaints), 1)
    
    # This month
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
    this_month = Complaint.query.filter(Complaint.created_at >= month_start).count()
    
    resolution_rate = round((resolved / total * 100), 1) if total > 0 else 0
    
    return jsonify({
        'success': True,
        'data': {
            'total': total,
            'resolved': resolved,
            'pending': pending,
            'urgent': urgent,
            'high_priority': high,
            'this_month': this_month,
            'avg_resolution_days': avg_days,
            'resolution_rate': resolution_rate,
        }
    })


@analytics_bp.route('/trends', methods=['GET'])
@jwt_required()
def trends():
    user_id = int(get_jwt_identity())
    if not admin_required(user_id):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    days = request.args.get('days', 30, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    daily_data = db.session.query(
        cast(Complaint.created_at, Date).label('date'),
        func.count(Complaint.id).label('count')
    ).filter(Complaint.created_at >= start_date)\
     .group_by(cast(Complaint.created_at, Date))\
     .order_by(cast(Complaint.created_at, Date))\
     .all()
    
    return jsonify({
        'success': True,
        'data': [{'date': str(row.date), 'count': row.count} for row in daily_data]
    })


@analytics_bp.route('/by-category', methods=['GET'])
@jwt_required()
def by_category():
    user_id = int(get_jwt_identity())
    if not admin_required(user_id):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    results = db.session.query(
        Complaint.category,
        func.count(Complaint.id).label('count')
    ).group_by(Complaint.category).all()
    
    return jsonify({
        'success': True,
        'data': [{'category': r.category or 'Unknown', 'count': r.count} for r in results]
    })


@analytics_bp.route('/by-priority', methods=['GET'])
@jwt_required()
def by_priority():
    user_id = int(get_jwt_identity())
    if not admin_required(user_id):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    results = db.session.query(
        Complaint.priority,
        func.count(Complaint.id).label('count')
    ).group_by(Complaint.priority).all()
    
    return jsonify({
        'success': True,
        'data': [{'priority': r.priority, 'count': r.count} for r in results]
    })


@analytics_bp.route('/department-performance', methods=['GET'])
@jwt_required()
def department_performance():
    user_id = int(get_jwt_identity())
    if not admin_required(user_id):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    depts = Department.query.all()
    performance = []
    
    for dept in depts:
        total = Complaint.query.filter_by(department_id=dept.id).count()
        if total == 0:
            continue
        resolved = Complaint.query.filter_by(department_id=dept.id, status='resolved').count()
        pending = Complaint.query.filter_by(department_id=dept.id).filter(
            Complaint.status.in_(['submitted', 'under_review', 'in_progress'])
        ).count()
        
        performance.append({
            'department': dept.name,
            'total': total,
            'resolved': resolved,
            'pending': pending,
            'resolution_rate': round(resolved / total * 100, 1) if total > 0 else 0,
        })
    
    return jsonify({'success': True, 'data': performance})


@analytics_bp.route('/insights', methods=['GET'])
@jwt_required()
def ai_insights():
    user_id = int(get_jwt_identity())
    if not admin_required(user_id):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    # Gather analytics data
    total = Complaint.query.count()
    resolved = Complaint.query.filter_by(status='resolved').count()
    
    category_data = db.session.query(
        Complaint.category, func.count(Complaint.id)
    ).group_by(Complaint.category).all()
    
    dept_data = db.session.query(
        Department.name, func.count(Complaint.id)
    ).join(Complaint, Complaint.department_id == Department.id)\
     .group_by(Department.name).all()
    
    priority_data = db.session.query(
        Complaint.priority, func.count(Complaint.id)
    ).group_by(Complaint.priority).all()
    
    analytics_data = {
        'total_complaints': total,
        'resolved_complaints': resolved,
        'resolution_rate': round(resolved/total*100, 1) if total > 0 else 0,
        'by_category': {r[0] or 'Unknown': r[1] for r in category_data},
        'by_department': {r[0]: r[1] for r in dept_data},
        'by_priority': {r[0]: r[1] for r in priority_data},
    }
    
    # Claude AI insights
    insights = claude_service.generate_analytics_insights(analytics_data)
    
    return jsonify({
        'success': True,
        'insights': insights,
        'raw_data': analytics_data
    })


@analytics_bp.route('/by-status', methods=['GET'])
@jwt_required()
def by_status():
    user_id = int(get_jwt_identity())
    if not admin_required(user_id):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    results = db.session.query(
        Complaint.status,
        func.count(Complaint.id).label('count')
    ).group_by(Complaint.status).all()
    
    return jsonify({
        'success': True,
        'data': [{'status': r.status, 'count': r.count} for r in results]
    })
