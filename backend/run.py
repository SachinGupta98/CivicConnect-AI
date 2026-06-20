from app import create_app
from app import db
from app.models import User, Department, Complaint, ComplaintUpdate, Notification
from sqlalchemy import select

app = create_app()

DEPARTMENTS = [
    {"name": "Water Supply", "code": "WS", "description": "Water distribution and pipeline management", "icon": "drop"},
    {"name": "Electricity", "code": "ELEC", "description": "Power supply and grid maintenance", "icon": "bolt"},
    {"name": "Roads & Infrastructure", "code": "ROAD", "description": "Road construction and maintenance", "icon": "road"},
    {"name": "Sanitation", "code": "SAN", "description": "Garbage collection and sewage management", "icon": "trash"},
    {"name": "Public Health", "code": "HEALTH", "description": "Healthcare and disease control", "icon": "health"},
    {"name": "Education", "code": "EDU", "description": "Schools and educational institutions", "icon": "book"},
    {"name": "Police", "code": "POLICE", "description": "Law enforcement and public safety", "icon": "police"},
    {"name": "Municipal Services", "code": "MUNI", "description": "General civic services and certificates", "icon": "building"},
    {"name": "Revenue Department", "code": "REV", "description": "Land records, taxes, and revenue", "icon": "clipboard"},
    {"name": "Housing", "code": "HOUSE", "description": "Building permits and housing schemes", "icon": "home"},
    {"name": "Transport", "code": "TRANS", "description": "Public transport and traffic management", "icon": "bus"},
    {"name": "Environment", "code": "ENV", "description": "Pollution control and environmental protection", "icon": "leaf"},
]

with app.app_context():
    try:
        db.create_all()
        
        # Safely seed departments
        for dept_data in DEPARTMENTS:
            existing = db.session.execute(select(Department).where(Department.code == dept_data['code'])).scalar_one_or_none()
            if not existing:
                db.session.add(Department(**dept_data))
                
        # Safely seed admin
        admin = db.session.execute(select(User).where(User.email == 'admin@civicconnect.gov')).scalar_one_or_none()
        if not admin:
            admin_user = User(name='System Admin', email='admin@civicconnect.gov', role='admin', phone='9999999999', language_pref='en')
            admin_user.set_password('Admin@1234')
            db.session.add(admin_user)
            
        try:
            db.session.commit()
        except Exception:
            db.session.rollback() # Handle race conditions gracefully across multiple Gunicorn workers
            
    except Exception as e:
        print(f"Failed to initialize database: {e}")

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Department': Department,
        'Complaint': Complaint,
        'Notification': Notification,
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
