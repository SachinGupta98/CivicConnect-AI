from datetime import datetime
from typing import Optional
# pyrefly: ignore [missing-import]
from .. import db


class Notification(db.Model):  # type: ignore[name-defined]
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default='info')  # info, success, warning, urgent
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id'), nullable=True)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    complaint = db.relationship('Complaint', foreign_keys=[complaint_id])

    def __init__(
        self,
        user_id: int,
        title: str,
        message: str,
        type: str = 'info',
        complaint_id: Optional[int] = None,
        is_read: bool = False,
    ) -> None:
        self.user_id = user_id
        self.title = title
        self.message = message
        self.type = type
        self.complaint_id = complaint_id
        self.is_read = is_read

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'complaint_id': self.complaint_id,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
