"""
ShiftWise Seed Data Generator
Pre-populates realistic enterprise business operations & shift workforce dataset
for Problem Statement 36 (CODESPRINT - CBC052)
"""
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from .models import (
    Employee, Shift, ShiftAssignment, AbsenceRecord,
    SwapRequest, SkillCourse, CourseEnrollment, SystemSettings, ActivityLog,
    Notification
)

def seed_database(db: Session, force: bool = False):
    if not force and db.query(Employee).count() > 0:
        return

    # Clear existing tables if force
    if force:
        db.query(Notification).delete()
        db.query(ActivityLog).delete()
        db.query(SwapRequest).delete()
        db.query(AbsenceRecord).delete()
        db.query(ShiftAssignment).delete()
        db.query(CourseEnrollment).delete()
        db.query(SkillCourse).delete()
        db.query(Shift).delete()
        db.query(Employee).delete()
        db.query(SystemSettings).delete()
        db.commit()

    # 1. System Settings
    settings = SystemSettings(
        hospital_name="ShiftWise Enterprise Business Operations (CBC052)",
        emergency_mode=False,
        min_rest_hours=11.0,
        max_weekly_hours=40.0,
        emergency_max_hours=56.0,
        auto_repair_enabled=True,
        last_repaired_at=datetime.utcnow() - timedelta(hours=6)
    )
    db.add(settings)

    # 2. Employees (16 diverse enterprise business operations staff)
    employees_data = [
        {
            "name": "Sarah Mitchell",
            "email": "sarah.mitchell@metrohealth.org",
            "phone": "+1 (555) 234-5678",
            "role": "Senior Operations Director",
            "department": "Operations & Logistics",
            "hourly_rate": 85.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 32.0,
            "fatigue_score": 28.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            "skills": ["Operations Lead", "Logistics", "Incident Management", "Six Sigma", "Workforce Planning", "Scrum"],
            "certifications": [
                {"name": "PMP", "code": "PMP-9921", "expiry": "2027-05-15", "status": "Active"},
                {"name": "Six Sigma Black Belt", "code": "SSBB-8812", "expiry": "2027-01-20", "status": "Active"},
                {"name": "ITIL-v4", "code": "ITIL-3310", "expiry": "2027-08-10", "status": "Active"}
            ],
            "availability": {"monday": ["07:00-23:00"], "tuesday": ["07:00-23:00"], "wednesday": ["07:00-23:00"], "thursday": ["07:00-23:00"], "friday": ["07:00-23:00"]}
        },
        {
            "name": "Marcus Chen",
            "email": "marcus.chen@metrohealth.org",
            "phone": "+1 (555) 345-6789",
            "role": "Lead Cloud Infrastructure Engineer",
            "department": "IT & Cloud Infrastructure",
            "hourly_rate": 58.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 36.0,
            "fatigue_score": 42.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            "skills": ["Cloud Ops", "SRE", "Incident Management", "DevOps", "Kubernetes"],
            "certifications": [
                {"name": "AWS-SysOps", "code": "AWS-9122", "expiry": "2026-11-30", "status": "Active"},
                {"name": "ITIL-v4", "code": "ITIL-4402", "expiry": "2027-04-12", "status": "Active"}
            ],
            "availability": {"monday": ["07:00-21:00"], "tuesday": ["07:00-21:00"], "wednesday": ["07:00-21:00"], "thursday": ["07:00-21:00"], "friday": ["07:00-21:00"]}
        },
        {
            "name": "Elena Rodriguez",
            "email": "elena.rodriguez@metrohealth.org",
            "phone": "+1 (555) 456-7890",
            "role": "Senior Logistics Dispatcher",
            "department": "Operations & Logistics",
            "hourly_rate": 44.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 24.0,
            "fatigue_score": 18.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1594824813512-25e24391cf8a?w=150&auto=format&fit=crop&q=80",
            "skills": ["Logistics", "ERP Systems", "Supply Chain", "Incident Management", "Bilingual"],
            "certifications": [
                {"name": "CSCP", "code": "CSCP-5120", "expiry": "2027-09-01", "status": "Active"},
                {"name": "Lean Six Sigma", "code": "LSS-771", "expiry": "2026-12-15", "status": "Active"}
            ],
            "availability": {"monday": ["06:00-22:00"], "wednesday": ["06:00-22:00"], "thursday": ["06:00-22:00"], "saturday": ["08:00-20:00"]}
        },
        {
            "name": "David Okafor",
            "email": "david.okafor@metrohealth.org",
            "phone": "+1 (555) 567-8901",
            "role": "Senior Financial Risk Analyst",
            "department": "Finance & Risk Management",
            "hourly_rate": 52.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 38.0,
            "fatigue_score": 55.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            "skills": ["Risk Analysis", "Financial Modeling", "SOX Compliance", "Audit", "ERP Systems"],
            "certifications": [
                {"name": "CFA", "code": "CFA-4491", "expiry": "2027-03-10", "status": "Active"},
                {"name": "SOX-Auditor", "code": "SOX-8821", "expiry": "2026-10-25", "status": "Expiring"}
            ],
            "availability": {"tuesday": ["07:00-23:00"], "wednesday": ["07:00-23:00"], "friday": ["07:00-23:00"], "sunday": ["07:00-23:00"]}
        },
        {
            "name": "Priya Sharma",
            "email": "priya.sharma@metrohealth.org",
            "phone": "+1 (555) 678-9012",
            "role": "Customer Operations Lead",
            "department": "Customer Operations",
            "hourly_rate": 65.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 20.0,
            "fatigue_score": 12.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80",
            "skills": ["Customer Success", "Escalation Lead", "SLA Management", "CRM Ops", "Workforce Planning"],
            "certifications": [
                {"name": "CCXP", "code": "CCXP-9011", "expiry": "2027-06-30", "status": "Active"},
                {"name": "PMP", "code": "PMP-6677", "expiry": "2027-11-14", "status": "Active"}
            ],
            "availability": {"monday": ["08:00-20:00"], "tuesday": ["08:00-20:00"], "thursday": ["08:00-20:00"], "friday": ["08:00-20:00"]}
        },
        {
            "name": "James Wilson",
            "email": "james.wilson@metrohealth.org",
            "phone": "+1 (555) 789-0123",
            "role": "Operations Dispatch Specialist",
            "department": "Operations & Logistics",
            "hourly_rate": 38.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 30.0,
            "fatigue_score": 35.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
            "skills": ["Logistics", "ERP Systems", "Inventory Tracking", "Route Optimization"],
            "certifications": [
                {"name": "Lean Six Sigma", "code": "LSS-1120", "expiry": "2027-02-15", "status": "Active"}
            ],
            "availability": {"monday": ["06:00-22:00"], "tuesday": ["06:00-22:00"], "wednesday": ["06:00-22:00"], "friday": ["06:00-22:00"]}
        },
        {
            "name": "Amina Al-Mansoor",
            "email": "amina.mansoor@metrohealth.org",
            "phone": "+1 (555) 890-1234",
            "role": "Site Reliability Engineer (SRE)",
            "department": "IT & Cloud Infrastructure",
            "hourly_rate": 55.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 16.0,
            "fatigue_score": 10.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
            "skills": ["SRE", "Cloud Ops", "Linux Ops", "Incident Management", "Monitoring"],
            "certifications": [
                {"name": "AWS-SysOps", "code": "AWS-4412", "expiry": "2027-07-20", "status": "Active"},
                {"name": "AWS-DevOps", "code": "AWS-8822", "expiry": "2027-09-15", "status": "Active"},
                {"name": "ITIL-v4", "code": "ITIL-9912", "expiry": "2027-08-05", "status": "Active"}
            ],
            "availability": {"thursday": ["07:00-23:00"], "friday": ["07:00-23:00"], "saturday": ["07:00-23:00"], "sunday": ["07:00-23:00"]}
        },
        {
            "name": "Liam Vance",
            "email": "liam.vance@metrohealth.org",
            "phone": "+1 (555) 901-2345",
            "role": "Quality & Compliance Officer",
            "department": "Quality & Compliance",
            "hourly_rate": 50.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 28.0,
            "fatigue_score": 20.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
            "skills": ["Quality Audit", "Regulatory Compliance", "ISO 9001", "Vendor Risk"],
            "certifications": [
                {"name": "CISA", "code": "CISA-3001", "expiry": "2027-10-18", "status": "Active"}
            ],
            "availability": {"monday": ["08:00-18:00"], "tuesday": ["08:00-18:00"], "wednesday": ["08:00-18:00"], "thursday": ["08:00-18:00"]}
        },
        {
            "name": "Kavita Patel",
            "email": "kavita.patel@metrohealth.org",
            "phone": "+1 (555) 012-3456",
            "role": "Client Escalation Specialist",
            "department": "Customer Operations",
            "hourly_rate": 42.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 18.0,
            "fatigue_score": 15.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            "skills": ["Customer Success", "SLA Management", "Account Retention", "CRM Ops"],
            "certifications": [
                {"name": "CCXP", "code": "CCXP-5541", "expiry": "2027-04-10", "status": "Active"},
                {"name": "ITIL-v4", "code": "ITIL-7822", "expiry": "2027-03-29", "status": "Active"}
            ],
            "availability": {"monday": ["07:00-21:00"], "wednesday": ["07:00-21:00"], "friday": ["07:00-21:00"], "saturday": ["07:00-21:00"]}
        },
        {
            "name": "Alexander Hayes",
            "email": "alex.hayes@metrohealth.org",
            "phone": "+1 (555) 123-4567",
            "role": "Internal Auditor & Risk Specialist",
            "department": "Finance & Risk Management",
            "hourly_rate": 46.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 32.0,
            "fatigue_score": 30.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
            "skills": ["Audit", "SOX Compliance", "Risk Modeling", "Financial Reporting"],
            "certifications": [
                {"name": "CIA", "code": "CIA-908", "expiry": "2027-01-15", "status": "Active"},
                {"name": "SOX-Auditor", "code": "SOX-4411", "expiry": "2026-11-20", "status": "Active"}
            ],
            "availability": {"tuesday": ["06:00-20:00"], "thursday": ["06:00-20:00"], "friday": ["06:00-20:00"], "saturday": ["06:00-20:00"]}
        },
        {
            "name": "Chloe Dupont",
            "email": "chloe.dupont@metrohealth.org",
            "phone": "+1 (555) 234-8901",
            "role": "Logistics Fulfillment Specialist",
            "department": "Operations & Logistics",
            "hourly_rate": 36.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 12.0,
            "fatigue_score": 8.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
            "skills": ["Supply Chain", "ERP Systems", "Logistics", "Inventory Ops"],
            "certifications": [
                {"name": "Lean Six Sigma", "code": "LSS-2090", "expiry": "2027-12-01", "status": "Active"}
            ],
            "availability": {"monday": ["12:00-24:00"], "wednesday": ["12:00-24:00"], "friday": ["12:00-24:00"], "sunday": ["12:00-24:00"]}
        },
        {
            "name": "Kenji Sato",
            "email": "kenji.sato@metrohealth.org",
            "phone": "+1 (555) 345-9012",
            "role": "NOC Systems Operations Analyst",
            "department": "IT & Cloud Infrastructure",
            "hourly_rate": 45.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 34.0,
            "fatigue_score": 40.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
            "skills": ["NOC Monitoring", "Incident Management", "Cloud Ops", "Network Telemetry"],
            "certifications": [
                {"name": "CompTIA Security+", "code": "SEC-8910", "expiry": "2027-05-22", "status": "Active"}
            ],
            "availability": {"monday": ["08:00-22:00"], "tuesday": ["08:00-22:00"], "thursday": ["08:00-22:00"], "saturday": ["08:00-22:00"]}
        },
        {
            "name": "Rachel Goldberg",
            "email": "rachel.goldberg@metrohealth.org",
            "phone": "+1 (555) 456-0123",
            "role": "Principal Enterprise Architect",
            "department": "IT & Cloud Infrastructure",
            "hourly_rate": 75.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 20.0,
            "fatigue_score": 15.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80",
            "skills": ["Cloud Ops", "Enterprise Architecture", "Security Governance", "Incident Management"],
            "certifications": [
                {"name": "AWS-Solutions-Architect", "code": "AWS-1188", "expiry": "2027-08-15", "status": "Active"},
                {"name": "CISSP", "code": "CISSP-9900", "expiry": "2027-09-12", "status": "Active"}
            ],
            "availability": {"monday": ["07:00-19:00"], "wednesday": ["07:00-19:00"], "friday": ["07:00-19:00"]}
        },
        {
            "name": "Carlos Gomez",
            "email": "carlos.gomez@metrohealth.org",
            "phone": "+1 (555) 567-1234",
            "role": "Supply Chain Procurement Analyst",
            "department": "Operations & Logistics",
            "hourly_rate": 40.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 22.0,
            "fatigue_score": 25.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
            "skills": ["Procurement", "Vendor Management", "ERP Systems", "Logistics"],
            "certifications": [
                {"name": "CSCP", "code": "CSCP-3344", "expiry": "2027-03-14", "status": "Active"}
            ],
            "availability": {"tuesday": ["10:00-24:00"], "thursday": ["10:00-24:00"], "saturday": ["10:00-24:00"], "sunday": ["10:00-24:00"]}
        },
        {
            "name": "Fatima Noor",
            "email": "fatima.noor@metrohealth.org",
            "phone": "+1 (555) 678-2345",
            "role": "Cloud Security & Compliance Specialist",
            "department": "Quality & Compliance",
            "hourly_rate": 54.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 12.0,
            "fatigue_score": 10.0,
            "status": "Reserve",
            "avatar_url": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
            "skills": ["Cloud Security", "ISO 27001", "Compliance Audit", "SOC2"],
            "certifications": [
                {"name": "CISSP", "code": "CISSP-7722", "expiry": "2027-05-18", "status": "Active"},
                {"name": "CISA", "code": "CISA-5522", "expiry": "2027-07-20", "status": "Active"}
            ],
            "availability": {"monday": ["00:00-24:00"], "wednesday": ["00:00-24:00"], "friday": ["00:00-24:00"]}
        },
        {
            "name": "Tyler Evans",
            "email": "tyler.evans@metrohealth.org",
            "phone": "+1 (555) 789-3456",
            "role": "Junior Operations Associate",
            "department": "Operations & Logistics",
            "hourly_rate": 32.0,
            "max_weekly_hours": 40.0,
            "current_weekly_hours": 10.0,
            "fatigue_score": 12.0,
            "status": "Active",
            "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
            "skills": ["Logistics", "Inventory Ops", "Process Support"],
            "certifications": [
                {"name": "Lean Six Sigma", "code": "LSS-9918", "expiry": "2027-08-30", "status": "Active"}
            ],
            "availability": {"monday": ["08:00-20:00"], "tuesday": ["08:00-20:00"], "wednesday": ["08:00-20:00"], "friday": ["08:00-20:00"]}
        }
    ]

    created_employees = []
    for ed in employees_data:
        emp = Employee(
            name=ed["name"],
            email=ed["email"],
            phone=ed["phone"],
            role=ed["role"],
            department=ed["department"],
            hourly_rate=ed["hourly_rate"],
            max_weekly_hours=ed["max_weekly_hours"],
            current_weekly_hours=ed["current_weekly_hours"],
            fatigue_score=ed["fatigue_score"],
            status=ed["status"],
            avatar_url=ed["avatar_url"]
        )
        emp.skills = ed["skills"]
        emp.certifications = ed["certifications"]
        emp.availability = ed["availability"]
        db.add(emp)
        created_employees.append(emp)

    db.commit()
    for e in created_employees:
        db.refresh(e)

    # 3. Shifts (14 realistic shifts over the current 7-day business roster)
    now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    base_date = now + timedelta(days=1)
    base_date = base_date.replace(hour=7, minute=0)

    shifts_data = [
        {
            "title": "Global Logistics Morning Dispatch",
            "department": "Operations & Logistics",
            "role_required": "Senior Logistics Dispatcher",
            "start_time": base_date,
            "end_time": base_date + timedelta(hours=8),
            "required_headcount": 5,
            "demand_level": "surge",
            "required_skills": ["Logistics", "ERP Systems", "Six Sigma"],
            "required_certifications": ["CSCP"],
            "notes": "High volume morning shipping and warehouse inventory release. Headcount increased to 5 staff members; certified skill in Six Sigma process required."
        },
        {
            "title": "24/7 Cloud NOC Day Watch",
            "department": "IT & Cloud Infrastructure",
            "role_required": "Lead Cloud Infrastructure Engineer",
            "start_time": base_date,
            "end_time": base_date + timedelta(hours=10),
            "required_headcount": 2,
            "demand_level": "normal",
            "required_skills": ["Cloud Ops", "SRE"],
            "required_certifications": ["AWS-SysOps"],
            "notes": "Mission critical cluster uptime monitoring and deployments."
        },
        {
            "title": "Operations Night Command & Escalation",
            "department": "Operations & Logistics",
            "role_required": "Senior Operations Director",
            "start_time": base_date + timedelta(hours=12),
            "end_time": base_date + timedelta(hours=22),
            "required_headcount": 1,
            "demand_level": "surge",
            "required_skills": ["Operations Lead", "Incident Management"],
            "required_certifications": ["PMP"],
            "notes": "Global cross-regional handoff and operational crisis lead."
        },
        {
            "title": "Enterprise Client Support Day Shift",
            "department": "Customer Operations",
            "role_required": "Customer Operations Lead",
            "start_time": base_date + timedelta(days=1),
            "end_time": base_date + timedelta(days=1, hours=8),
            "required_headcount": 2,
            "demand_level": "normal",
            "required_skills": ["Customer Success", "SLA Management"],
            "required_certifications": ["CCXP"],
            "notes": "Tier-3 enterprise VIP client support and contract SLAs."
        },
        {
            "title": "Financial Settlement & Risk Audit",
            "department": "Finance & Risk Management",
            "role_required": "Senior Financial Risk Analyst",
            "start_time": base_date + timedelta(days=1, hours=8),
            "end_time": base_date + timedelta(days=1, hours=16),
            "required_headcount": 2,
            "demand_level": "high",
            "required_skills": ["Risk Analysis", "SOX Compliance"],
            "required_certifications": ["CFA"],
            "notes": "Mid-month trade ledger reconciliation and risk audit."
        },
        {
            "title": "Cloud Infrastructure Night Watch",
            "department": "IT & Cloud Infrastructure",
            "role_required": "Lead Cloud Infrastructure Engineer",
            "start_time": base_date + timedelta(hours=18),
            "end_time": base_date + timedelta(hours=28),
            "required_headcount": 2,
            "demand_level": "normal",
            "required_skills": ["Cloud Ops", "SRE"],
            "required_certifications": ["AWS-SysOps"],
            "notes": "Overnight patching and automated failover monitoring."
        },
        {
            "title": "Weekend Distribution Rapid Dispatch",
            "department": "Operations & Logistics",
            "role_required": "Senior Logistics Dispatcher",
            "start_time": base_date + timedelta(days=2),
            "end_time": base_date + timedelta(days=2, hours=8),
            "required_headcount": 2,
            "demand_level": "high",
            "required_skills": ["Logistics", "Supply Chain"],
            "required_certifications": ["CSCP"],
            "notes": "Weekend surge shipping order verification."
        },
        {
            "title": "Quality & Regulatory Compliance Audit",
            "department": "Quality & Compliance",
            "role_required": "Quality & Compliance Officer",
            "start_time": base_date + timedelta(days=2, hours=2),
            "end_time": base_date + timedelta(days=2, hours=10),
            "required_headcount": 1,
            "demand_level": "normal",
            "required_skills": ["Quality Audit", "ISO 9001"],
            "required_certifications": ["CISA"],
            "notes": "Quarterly ISO process documentation and vendor audits."
        },
        {
            "title": "Client Escalation Evening Coverage",
            "department": "Customer Operations",
            "role_required": "Client Escalation Specialist",
            "start_time": base_date + timedelta(days=2, hours=12),
            "end_time": base_date + timedelta(days=2, hours=20),
            "required_headcount": 1,
            "demand_level": "normal",
            "required_skills": ["Customer Success", "SLA Management"],
            "required_certifications": ["ITIL-v4"],
            "notes": "APAC and EMEA overlapping hours priority ticket triage."
        },
        {
            "title": "Logistics Fulfillment Night Shift",
            "department": "Operations & Logistics",
            "role_required": "Logistics Fulfillment Specialist",
            "start_time": base_date + timedelta(days=2, hours=20),
            "end_time": base_date + timedelta(days=3, hours=6),
            "required_headcount": 2,
            "demand_level": "surge",
            "required_skills": ["Supply Chain", "ERP Systems"],
            "required_certifications": ["Lean Six Sigma"],
            "notes": "Overnight automated fulfillment system supervision."
        },
        {
            "title": "Corporate Financial Controls Prep",
            "department": "Finance & Risk Management",
            "role_required": "Internal Auditor & Risk Specialist",
            "start_time": base_date + timedelta(days=3, hours=6),
            "end_time": base_date + timedelta(days=3, hours=14),
            "required_headcount": 1,
            "demand_level": "normal",
            "required_skills": ["Audit", "SOX Compliance"],
            "required_certifications": ["CIA"],
            "notes": "Preparation for external audit and ledger reconciliations."
        },
        {
            "title": "Sunday Operations Command Lead",
            "department": "Operations & Logistics",
            "role_required": "Senior Operations Director",
            "start_time": base_date + timedelta(days=3, hours=12),
            "end_time": base_date + timedelta(days=3, hours=22),
            "required_headcount": 1,
            "demand_level": "high",
            "required_skills": ["Operations Lead", "Incident Management"],
            "required_certifications": ["PMP"],
            "notes": "Weekend operational continuity and incident oversight."
        },
        {
            "title": "Critical Cloud Infrastructure SRE",
            "department": "IT & Cloud Infrastructure",
            "role_required": "Lead Cloud Infrastructure Engineer",
            "start_time": base_date + timedelta(days=4, hours=7),
            "end_time": base_date + timedelta(days=4, hours=17),
            "required_headcount": 2,
            "demand_level": "normal",
            "required_skills": ["Cloud Ops", "SRE"],
            "required_certifications": ["AWS-SysOps"],
            "notes": "High availability Kubernetes ingress management."
        },
        {
            "title": "Monday Peak Demand Fulfillment",
            "department": "Operations & Logistics",
            "role_required": "Senior Logistics Dispatcher",
            "start_time": base_date + timedelta(days=5, hours=6),
            "end_time": base_date + timedelta(days=5, hours=14),
            "required_headcount": 3,
            "demand_level": "surge",
            "required_skills": ["Logistics", "ERP Systems"],
            "required_certifications": ["CSCP"],
            "notes": "Weekly order spike distribution and express shipments."
        }
    ]

    created_shifts = []
    for sd in shifts_data:
        sh = Shift(
            title=sd["title"],
            department=sd["department"],
            role_required=sd["role_required"],
            start_time=sd["start_time"],
            end_time=sd["end_time"],
            required_headcount=sd["required_headcount"],
            demand_level=sd["demand_level"],
            status="published",
            notes=sd["notes"]
        )
        sh.required_skills = sd["required_skills"]
        sh.required_certifications = sd["required_certifications"]
        db.add(sh)
        created_shifts.append(sh)

    db.commit()
    for s in created_shifts:
        db.refresh(s)

    # 4. Partial Assignments:
    # We assign some qualified staff, leave some gaps, and introduce 1 rest conflict
    # so the user can showcase "Conflict Detection" and "One-Click Schedule Repair"!
    assignments_to_create = [
        # Shift 0: Global Logistics Morning Dispatch (Needs 2) -> Assign Elena
        (created_shifts[0].id, created_employees[2].id, "confirmed"),
        # Shift 1: 24/7 Cloud NOC Day Watch (Needs 2) -> Assign Marcus & Amina
        (created_shifts[1].id, created_employees[1].id, "confirmed"),
        (created_shifts[1].id, created_employees[6].id, "confirmed"),
        # Shift 2: Operations Night Command (Needs 1) -> Assign Sarah Mitchell
        (created_shifts[2].id, created_employees[0].id, "confirmed"),
        # Shift 3: Enterprise Client Support (Needs 2) -> Assign Priya & Kavita
        (created_shifts[3].id, created_employees[4].id, "confirmed"),
        (created_shifts[3].id, created_employees[8].id, "confirmed"),
        # Shift 4: Financial Settlement (Needs 2) -> Assign David Okafor
        (created_shifts[4].id, created_employees[3].id, "confirmed"),
        # Shift 5: Cloud Infrastructure Night Watch (Needs 2) -> Assign Marcus (Note: Only 8h rest after prior shift -> triggers rest breach conflict for demo!)
        (created_shifts[5].id, created_employees[1].id, "conflict_flagged"),
        # Shift 7: Quality & Regulatory Compliance (Needs 1) -> Assign Liam Vance
        (created_shifts[7].id, created_employees[7].id, "confirmed"),
        # Shift 10: Financial Controls Prep (Needs 1) -> Assign Alexander Hayes
        (created_shifts[10].id, created_employees[9].id, "confirmed"),
    ]

    for s_id, e_id, status in assignments_to_create:
        assign = ShiftAssignment(
            shift_id=s_id,
            employee_id=e_id,
            status=status,
            conflict_notes="Rest period under 11 hours" if status == "conflict_flagged" else ""
        )
        db.add(assign)

    # 5. Absence Records
    absence = AbsenceRecord(
        employee_id=created_employees[11].id, # Kenji Sato
        start_date=base_date + timedelta(days=2),
        end_date=base_date + timedelta(days=3),
        reason="Medical Leave / Flu Symptoms",
        status="approved"
    )
    db.add(absence)

    # 6. Skill Upgrade Academy Courses
    courses_data = [
        {
            "title": "Lean Six Sigma Black Belt (LSS-BB)",
            "category": "Operations",
            "target_skill": "Six Sigma",
            "target_cert": "Six Sigma Black Belt",
            "description": "Comprehensive process optimization, statistical quality control, and lean waste reduction methods.",
            "duration_hours": 6.5,
            "modules_count": 6,
            "enrolled_count": 8,
            "level": "Advanced"
        },
        {
            "title": "AWS SysOps & Cloud SRE Operations",
            "category": "Technology",
            "target_skill": "SRE",
            "target_cert": "AWS-SysOps",
            "description": "Enterprise cloud high-availability architectures, Kubernetes pod resilience, and automated disaster failover.",
            "duration_hours": 5.0,
            "modules_count": 5,
            "enrolled_count": 12,
            "level": "Intermediate"
        },
        {
            "title": "ITIL-v4 Service Delivery & Incident Command",
            "category": "Management",
            "target_skill": "Incident Management",
            "target_cert": "ITIL-v4",
            "description": "Major incident management protocols, root-cause triage, and cross-functional escalation leadership.",
            "duration_hours": 8.0,
            "modules_count": 8,
            "enrolled_count": 15,
            "level": "Specialist"
        },
        {
            "title": "Enterprise Agile Leadership & Workforce Management",
            "category": "Leadership",
            "target_skill": "Operations Lead",
            "target_cert": "PMP",
            "description": "Workforce capacity forecasting, enterprise resource balancing, and agile shift dispatch coordination.",
            "duration_hours": 4.0,
            "modules_count": 4,
            "enrolled_count": 6,
            "level": "Executive"
        },
        {
            "title": "Certified Supply Chain Professional (CSCP)",
            "category": "Operations",
            "target_skill": "Logistics",
            "target_cert": "CSCP",
            "description": "End-to-end supply chain visibility, warehouse distribution mechanics, and ERP logistics integration.",
            "duration_hours": 3.5,
            "modules_count": 4,
            "enrolled_count": 20,
            "level": "Core"
        },
        {
            "title": "ISO 27001 Security & SOC2 Compliance Audit",
            "category": "Compliance",
            "target_skill": "Quality Audit",
            "target_cert": "CISA",
            "description": "Corporate information security governance, SOC2 audit controls, and vendor compliance certification.",
            "duration_hours": 3.0,
            "modules_count": 3,
            "enrolled_count": 14,
            "level": "Foundational"
        }
    ]

    created_courses = []
    for cd in courses_data:
        course = SkillCourse(
            title=cd["title"],
            category=cd["category"],
            target_skill=cd["target_skill"],
            target_cert=cd["target_cert"],
            description=cd["description"],
            duration_hours=cd["duration_hours"],
            modules_count=cd["modules_count"],
            enrolled_count=cd["enrolled_count"],
            level=cd["level"]
        )
        db.add(course)
        created_courses.append(course)

    db.commit()
    for c in created_courses:
        db.refresh(c)

    # Enroll junior associate Tyler Evans in CSCP Supply Chain Course (progress: 65%)
    enrollment = CourseEnrollment(
        employee_id=created_employees[15].id, # Tyler Evans
        course_id=created_courses[4].id, # CSCP
        progress=65.0,
        status="in_progress"
    )
    db.add(enrollment)

    # 7. Initial Swap Request for Demo
    swap = SwapRequest(
        requester_id=created_employees[5].id, # James Wilson
        target_employee_id=created_employees[2].id, # Elena Rodriguez
        shift_id=created_shifts[0].id,
        status="pending",
        compatibility_score=94.5,
        compatibility_analysis_json='["High skill synergy", "Zero rest period violations", "Complies with weekly hour caps"]'
    )
    db.add(swap)

    # 8. Activity Logs
    logs_data = [
        ("System initialized with ShiftWise Business Operations engine.", "info"),
        ("Shift 'Global Logistics Morning Dispatch' capacity expanded to 5 people. Skill upgrade notifications dispatched to 5 team members to complete Lean Six Sigma certification in Training Academy.", "warning"),
        ("Roster generated: 14 shifts created across 5 enterprise business units.", "info"),
        ("Staffing Gap Alert: 6 unfilled shifts require allocation.", "warning"),
        ("Conflict scanner detected: 1 rest gap breach between Day and Night shifts.", "critical"),
    ]
    for desc, sev in logs_data:
        l = ActivityLog(action_type="system", description=desc, severity=sev)
        db.add(l)

    # 9. Skill Upgrade Notifications (Notified 5 staff members to upgrade to new skills for the 5-person shift)
    notified_staff = [
        (created_employees[15], "Tyler Evans", "Junior Operations Associate"),
        (created_employees[2], "Elena Rodriguez", "Senior Logistics Dispatcher"),
        (created_employees[13], "Carlos Gomez", "Supply Chain Procurement Analyst"),
        (created_employees[10], "Chloe Dupont", "Logistics Fulfillment Specialist"),
        (created_employees[5], "James Wilson", "Operations Dispatch Specialist"),
    ]
    six_sigma_course = created_courses[0] # Lean Six Sigma Black Belt

    for emp_obj, name, role in notified_staff:
        notif = Notification(
            employee_id=emp_obj.id,
            shift_id=created_shifts[0].id,
            title=f"Skill Upgrade Required: Global Logistics Morning Dispatch (5 People Needed)",
            message=f"{name} ({role}): The shift 'Global Logistics Morning Dispatch' has been expanded to 5 required personnel and now requires 'Six Sigma'. Please complete '{six_sigma_course.title}' in the Skill Academy to qualify for this shift.",
            category="skill_upgrade",
            target_skill="Six Sigma",
            target_cert="Six Sigma Black Belt",
            course_id=six_sigma_course.id,
            is_read=False,
            created_at=datetime.utcnow() - timedelta(minutes=random.randint(5, 45))
        )
        db.add(notif)

    db.commit()
    print("Database successfully seeded with realistic ShiftWise enterprise business data!")
