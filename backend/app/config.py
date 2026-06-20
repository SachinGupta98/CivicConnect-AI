import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env from the backend directory explicitly
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-dev-secret')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'postgresql://postgres:Postgre9887@localhost:5432/civicconnect_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
    ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
    
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))
    CORS_ORIGINS = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
    ]

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
