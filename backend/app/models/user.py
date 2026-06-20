from datetime import datetime
from typing import Optional
# pyrefly: ignore [missing-import]
from .. import db, bcrypt


class User(db.Model):  # type: ignore[name-defined]
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(30), default='citizen')  # citizen, admin, department_head
    phone = db.Column(db.String(20))
    language_pref = db.Column(db.String(10), default='en')
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    complaints = db.relationship('Complaint', foreign_keys='Complaint.user_id', backref='citizen', lazy='dynamic')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic')

    def __init__(
        self,
        name: str,
        email: str,
        role: str = 'citizen',
        phone: str = '',
        language_pref: str = 'en',
        department_id: Optional[int] = None,
        is_active: bool = True,
    ) -> None:
        self.name = name
        self.email = email
        self.password_hash = ''  # set via set_password()
        self.role = role
        self.phone = phone
        self.language_pref = language_pref
        self.department_id = department_id
        self.is_active = is_active

    def set_password(self, password: str) -> None:
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password: str) -> bool:
        return bool(bcrypt.check_password_hash(self.password_hash, password))

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'language_pref': self.language_pref,
            'department_id': self.department_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
