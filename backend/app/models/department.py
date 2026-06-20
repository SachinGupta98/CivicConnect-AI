from datetime import datetime
from typing import Optional
from .. import db


class Department(db.Model):  # type: ignore[name-defined]
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    code = db.Column(db.String(20), nullable=False, unique=True)
    description = db.Column(db.Text)
    email = db.Column(db.String(150))
    phone = db.Column(db.String(20))
    icon = db.Column(db.String(50), default='building')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    complaints = db.relationship('Complaint', backref='dept', lazy='dynamic')
    staff = db.relationship('User', backref='department', lazy='dynamic')

    def __init__(
        self,
        name: str,
        code: str,
        description: str = '',
        email: str = '',
        phone: str = '',
        icon: str = 'building',
        is_active: bool = True,
    ) -> None:
        self.name = name
        self.code = code
        self.description = description
        self.email = email
        self.phone = phone
        self.icon = icon
        self.is_active = is_active

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'email': self.email,
            'phone': self.phone,
            'icon': self.icon,
            'is_active': self.is_active,
        }
