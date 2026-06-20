from flask import Blueprint, request, jsonify
# pyrefly: ignore [missing-import]
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select
# pyrefly: ignore [missing-import]
from ..models.department import Department
# pyrefly: ignore [missing-import]
from ..models.user import User
# pyrefly: ignore [missing-import]
from .. import db

departments_bp = Blueprint('departments', __name__)


@departments_bp.route('/', methods=['GET'])
def get_departments():
    stmt = select(Department).where(Department.is_active.is_(True))  # type: ignore[attr-defined]
    departments = db.session.execute(stmt).scalars().all()
    return jsonify({'success': True, 'departments': [d.to_dict() for d in departments]})


@departments_bp.route('/<int:dept_id>', methods=['GET'])
def get_department(dept_id: int):
    dept = db.session.get(Department, dept_id)
    if dept is None:
        return jsonify({'success': False, 'message': 'Department not found'}), 404
    return jsonify({'success': True, 'department': dept.to_dict()})


@departments_bp.route('/', methods=['POST'])
@jwt_required()
def create_department():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if user is None or user.role != 'admin':
        return jsonify({'success': False, 'message': 'Admin only'}), 403

    data = request.get_json()
    dept = Department(
        name=data['name'],
        code=data['code'],
        description=data.get('description', ''),
        email=data.get('email', ''),
        phone=data.get('phone', ''),
        icon=data.get('icon', ''),
    )
    db.session.add(dept)
    db.session.commit()
    return jsonify({'success': True, 'department': dept.to_dict()}), 201
