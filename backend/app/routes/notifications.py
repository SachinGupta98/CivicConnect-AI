from flask import Blueprint, request, jsonify
# pyrefly: ignore [missing-import]
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select, func, cast, Integer
# pyrefly: ignore [missing-import]
from ..models.notification import Notification
# pyrefly: ignore [missing-import]
from .. import db

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = 20

    stmt = (
        select(Notification)
        .filter_by(user_id=user_id)  # type: ignore[arg-type]
        .order_by(Notification.created_at.desc())  # type: ignore[attr-defined]
    )
    all_notifs = db.session.execute(stmt).scalars().all()

    # Manual pagination
    total = len(all_notifs)
    start = (page - 1) * per_page
    items = all_notifs[start: start + per_page]

    unread_count_stmt = (
        select(func.count())
        .select_from(Notification)
        .filter_by(user_id=user_id, is_read=False)  # type: ignore[arg-type]
    )
    unread_count: int = db.session.execute(unread_count_stmt).scalar() or 0

    return jsonify({
        'success': True,
        'notifications': [n.to_dict() for n in items],
        'unread_count': unread_count,
        'total': total,
    })


@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    stmt = (
        select(Notification)
        .filter_by(user_id=user_id, is_read=False)  # type: ignore[arg-type]
    )
    notifs = db.session.execute(stmt).scalars().all()
    for notif in notifs:
        notif.is_read = True
    db.session.commit()
    return jsonify({'success': True, 'message': 'All notifications marked as read'})


@notifications_bp.route('/<int:notif_id>/read', methods=['PATCH'])
@jwt_required()
def mark_read(notif_id: int):
    user_id = int(get_jwt_identity())
    stmt = (
        select(Notification)
        .filter_by(id=notif_id, user_id=user_id)  # type: ignore[arg-type]
    )
    notif = db.session.execute(stmt).scalar_one_or_none()
    if notif is None:
        return jsonify({'success': False, 'message': 'Notification not found'}), 404
    notif.is_read = True
    db.session.commit()
    return jsonify({'success': True})
