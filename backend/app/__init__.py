from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from .config import config
import os

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
bcrypt = Bcrypt()

# JWT token blocklist
jwt_blocklist = set()

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__, static_folder='../../frontend/dist', static_url_path='/')
    app.config.from_object(config.get(config_name, config['default']))
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    
    CORS(app, 
         origins=app.config['CORS_ORIGINS'],
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])
    
    # JWT blocklist check
    @jwt.token_in_blocklist_loader
    def check_if_token_in_blocklist(jwt_header, jwt_payload):
        return jwt_payload['jti'] in jwt_blocklist
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return {'success': False, 'message': 'Token has been revoked'}, 401
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'success': False, 'message': 'Token has expired'}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {'success': False, 'message': 'Invalid token'}, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {'success': False, 'message': 'Authorization token required'}, 401

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.complaints import complaints_bp
    from .routes.analytics import analytics_bp
    from .routes.assistant import assistant_bp
    from .routes.departments import departments_bp
    from .routes.notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(complaints_bp, url_prefix='/api/complaints')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(assistant_bp, url_prefix='/api/assistant')
    app.register_blueprint(departments_bp, url_prefix='/api/departments')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

    @app.route('/api/health')
    def health():
        return {'status': 'healthy', 'message': 'CivicConnect AI is running'}

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return app.send_static_file(path)
        else:
            return app.send_static_file('index.html')

    return app
