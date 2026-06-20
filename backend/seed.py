# -*- coding: utf-8 -*-
"""Seed initial data: departments and admin user."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User
from app.models.department import Department
from sqlalchemy import select

app = create_app()

DEPARTMENTS: list[dict] = [
    {"name": "Water Supply",          "code": "WS",     "description": "Water distribution and pipeline management",  "icon": "drop"},
    {"name": "Electricity",            "code": "ELEC",   "description": "Power supply and grid maintenance",            "icon": "bolt"},
    {"name": "Roads & Infrastructure", "code": "ROAD",   "description": "Road construction and maintenance",            "icon": "road"},
    {"name": "Sanitation",             "code": "SAN",    "description": "Garbage collection and sewage management",     "icon": "trash"},
    {"name": "Public Health",          "code": "HEALTH", "description": "Healthcare and disease control",               "icon": "health"},
    {"name": "Education",              "code": "EDU",    "description": "Schools and educational institutions",         "icon": "book"},
    {"name": "Police",                 "code": "POLICE", "description": "Law enforcement and public safety",            "icon": "police"},
    {"name": "Municipal Services",     "code": "MUNI",   "description": "General civic services and certificates",      "icon": "building"},
    {"name": "Revenue Department",     "code": "REV",    "description": "Land records, taxes, and revenue",             "icon": "clipboard"},
    {"name": "Housing",                "code": "HOUSE",  "description": "Building permits and housing schemes",         "icon": "home"},
    {"name": "Transport",              "code": "TRANS",  "description": "Public transport and traffic management",      "icon": "bus"},
    {"name": "Environment",            "code": "ENV",    "description": "Pollution control and environmental protection","icon": "leaf"},
]

with app.app_context():
    db.create_all()
    print("[OK] Database tables created")

    # Seed departments
    for dept_data in DEPARTMENTS:
        stmt = select(Department).where(Department.code == dept_data['code'])
        existing = db.session.execute(stmt).scalar_one_or_none()
        if existing is None:
            dept = Department(
                name=dept_data['name'],
                code=dept_data['code'],
                description=dept_data['description'],
                icon=dept_data['icon'],
            )
            db.session.add(dept)
    db.session.commit()
    print(f"[OK] Seeded {len(DEPARTMENTS)} departments")

    # Create admin user
    stmt = select(User).where(User.email == 'admin@civicconnect.gov')  # type: ignore[attr-defined]
    admin = db.session.execute(stmt).scalar_one_or_none()
    if admin is None:
        admin = User(
            name='System Admin',
            email='admin@civicconnect.gov',
            role='admin',
            phone='9999999999',
            language_pref='en',
        )
        admin.set_password('Admin@1234')
        db.session.add(admin)
        db.session.commit()
        print("[OK] Admin user created: admin@civicconnect.gov / Admin@1234")
    else:
        print("[INFO] Admin already exists")

    print("\n[DONE] Database seeded successfully!")
    print("   Admin: admin@civicconnect.gov")
    print("   Password: Admin@1234")
