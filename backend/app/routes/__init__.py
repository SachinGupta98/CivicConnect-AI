from .auth import auth_bp
from .complaints import complaints_bp
from .analytics import analytics_bp
from .assistant import assistant_bp
from .departments import departments_bp
from .notifications import notifications_bp

__all__ = ['auth_bp', 'complaints_bp', 'analytics_bp', 'assistant_bp', 'departments_bp', 'notifications_bp']
