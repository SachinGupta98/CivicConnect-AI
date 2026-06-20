from app import create_app
from app import db
from app.models import User, Department, Complaint, ComplaintUpdate, Notification

app = create_app()

with app.app_context():
    try:
        db.create_all()
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
