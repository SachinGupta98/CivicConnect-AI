from typing import Optional
from ..models.notification import Notification
from .. import db


def create_notification(
    user_id: int,
    title: str,
    message: str,
    notif_type: str = 'info',
    complaint_id: Optional[int] = None
) -> Notification:
    """Create a notification for a user."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type,
        complaint_id=complaint_id
    )
    db.session.add(notif)
    db.session.commit()
    return notif


def notify_complaint_submitted(user_id: int, complaint_number: str, complaint_id: int) -> Notification:
    return create_notification(
        user_id,
        "Complaint Submitted Successfully",
        f"Your complaint #{complaint_number} has been received and is being processed by our AI system.",
        "success",
        complaint_id
    )


def notify_status_update(user_id: int, complaint_number: str, new_status: str, complaint_id: int) -> Notification:
    status_messages = {
        'under_review': 'is now under review',
        'in_progress': 'is being actively worked on',
        'resolved': 'has been resolved',
        'rejected': 'has been closed'
    }
    msg = status_messages.get(new_status, f'status changed to {new_status}')
    notif_type = 'success' if new_status == 'resolved' else ('warning' if new_status == 'rejected' else 'info')

    return create_notification(
        user_id,
        f"Complaint #{complaint_number} Update",
        f"Your complaint #{complaint_number} {msg}. Check your dashboard for details.",
        notif_type,
        complaint_id
    )


def notify_urgent_complaint(admin_ids: list[int], complaint_number: str, complaint_id: int) -> None:
    for admin_id in admin_ids:
        create_notification(
            admin_id,
            "[URGENT] Complaint Requires Attention",
            f"Complaint #{complaint_number} has been flagged as URGENT by AI analysis. Immediate action required.",
            "urgent",
            complaint_id
        )
