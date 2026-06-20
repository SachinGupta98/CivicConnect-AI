from datetime import datetime
from .. import db

class Complaint(db.Model):
    __tablename__ = 'complaints'
    
    id = db.Column(db.Integer, primary_key=True)
    complaint_number = db.Column(db.String(20), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100))
    sub_category = db.Column(db.String(100))
    location = db.Column(db.String(200))
    
    # AI-generated fields
    ai_summary = db.Column(db.Text)
    ai_category = db.Column(db.String(100))
    ai_department = db.Column(db.String(100))
    sentiment_score = db.Column(db.Float, default=0.0)  # -1 to 1
    urgency_justification = db.Column(db.Text)
    
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    status = db.Column(db.String(30), default='submitted')  # submitted, under_review, in_progress, resolved, rejected
    
    # Media
    attachments = db.Column(db.JSON, default=list)
    voice_transcript = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    
    updates = db.relationship('ComplaintUpdate', backref='complaint', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_updates=False):
        data = {
            'id': self.id,
            'complaint_number': self.complaint_number,
            'user_id': self.user_id,
            'department_id': self.department_id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'sub_category': self.sub_category,
            'location': self.location,
            'ai_summary': self.ai_summary,
            'ai_category': self.ai_category,
            'ai_department': self.ai_department,
            'sentiment_score': self.sentiment_score,
            'urgency_justification': self.urgency_justification,
            'priority': self.priority,
            'status': self.status,
            'attachments': self.attachments or [],
            'voice_transcript': self.voice_transcript,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
            'updated_at': self.updated_at.isoformat() + 'Z' if self.updated_at else None,
            'resolved_at': self.resolved_at.isoformat() + 'Z' if self.resolved_at else None,
            'citizen_name': self.citizen.name if self.citizen else None,
            'department_name': self.dept.name if self.dept else None,
        }
        if include_updates:
            data['updates'] = [u.to_dict() for u in self.updates.order_by(ComplaintUpdate.created_at)]
        return data


class ComplaintUpdate(db.Model):
    __tablename__ = 'complaint_updates'
    
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id'), nullable=False)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status_change = db.Column(db.String(30))
    is_internal = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    updater = db.relationship('User', foreign_keys=[updated_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'message': self.message,
            'status_change': self.status_change,
            'is_internal': self.is_internal,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
            'updated_by_name': self.updater.name if self.updater else 'System',
        }
