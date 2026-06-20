from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from ..models.user import User
from ..models.department import Department
from .. import db, jwt_blocklist

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    required = ['name', 'email', 'password']
    for field in required:
        if not data.get(field):
            return jsonify({'success': False, 'message': f'{field} is required'}), 400
    
    if len(data['password']) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
    
    if User.query.filter_by(email=data['email'].lower()).first():
        return jsonify({'success': False, 'message': 'Email already registered'}), 409
    
    user = User(
        name=data['name'].strip(),
        email=data['email'].lower().strip(),
        role=data.get('role', 'citizen'),
        phone=data.get('phone', ''),
        language_pref=data.get('language_pref', 'en'),
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'success': True,
        'message': 'Registration successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'success': False, 'message': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email'].lower()).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
    
    if not user.is_active:
        return jsonify({'success': False, 'message': 'Account is deactivated'}), 403
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    })


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({'success': True, 'access_token': access_token})


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    jwt_blocklist.add(jti)
    return jsonify({'success': True, 'message': 'Logged out successfully'})


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify({'success': True, 'user': user.to_dict()})


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_me():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if data.get('name'):
        user.name = data['name'].strip()
    if data.get('phone'):
        user.phone = data['phone']
    if data.get('language_pref'):
        user.language_pref = data['language_pref']
    if data.get('password'):
        if len(data['password']) < 6:
            return jsonify({'success': False, 'message': 'Password too short'}), 400
        user.set_password(data['password'])
    
    db.session.commit()
    return jsonify({'success': True, 'user': user.to_dict()})
