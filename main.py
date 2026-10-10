"""
ShiftWise - FastAPI Server
Smart Shift Scheduling with Gap and Conflict Detection
Problem Statement 36 | Team CODESPRINT (CBC052)
"""
import os
import sys
from pathlib import Path

# Ensure package context is available when executing main.py directly as a script
if __package__ is None or __package__ == "":
    parent_dir = str(Path(__file__).resolve().parent.parent)
    if parent_dir not in sys.path:
        sys.path.insert(0, parent_dir)
    __package__ = "backend"

import random
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .models import (
    Employee, Shift, ShiftAssignment, AbsenceRecord,
    SwapRequest, SkillCourse, CourseEnrollment, SystemSettings, ActivityLog,
    Notification
)
from .schemas import (
    LoginRequest,
    EmployeeCreate, EmployeeUpdate, EmployeeOut,
    ShiftCreate, ShiftUpdate, AssignRequest,
    SwapCheckRequest, SwapCreateRequest, SimulatorRequest,
    CourseCompleteRequest, SettingsUpdate,
    NotifyUpgradeRequest, NotificationCreate
)
from .scheduler import (
    detect_conflicts, auto_assign_shifts, repair_schedule,
    calculate_resilience_score, get_replacement_candidates,
    check_swap_compatibility, generate_skill_heatmap,
    run_what_if_simulation, get_system_settings, get_employee_weekly_hours
)
from .seed_data import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI
app = FastAPI(
    title="ShiftWise API",
    description="Smart Shift Scheduling with Gap and Conflict Detection",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database on startup if empty
@app.on_event("startup")
def startup_event():
    from .database import SessionLocal
    db = SessionLocal()
    try:
        seed_database(db, force=False)
    finally:
        db.close()


# ---------------- AUTHENTICATION & DEMO CREDENTIALS ----------------

DEMO_CREDENTIALS = {
    "druvith.raj@metrohealth.org": {
        "password": "hospital2026!",
        "name": "Dr. Druvith Raj",
        "role": "Business Operations Director",
        "department": "All Business Units",
        "avatar_url": "/static/assets/druvith_raj.jpg",
        "badge_id": "MH-DIR-01",
        "access_level": "Executive Authority",
        "tag": "Operations VP"
    },
    "elena.rostova@metrohealth.org": {
        "password": "supervisor2026!",
        "name": "Elena Rostova",
        "role": "Operations Shift Supervisor",
        "department": "Operations & Logistics",
        "avatar_url": "https://images.unsplash.com/photo-1594824813571-638f0263613a?w=150",
        "badge_id": "BIZ-OPS-44",
        "access_level": "Operations Supervisor",
        "tag": "Shift Supervisor"
    },
    "emily.thorne@metrohealth.org": {
        "password": "cloudops2026!",
        "name": "Emily Thorne",
        "role": "Lead Cloud Infrastructure Engineer",
        "department": "IT & Cloud Infrastructure",
        "avatar_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150",
        "badge_id": "BIZ-ENG-18",
        "access_level": "Lead Engineer",
        "tag": "Lead SRE"
    },
    "admin.console@metrohealth.org": {
        "password": "adminsecure2026!",
        "name": "Administrator Console",
        "role": "Enterprise Systems Auditor",
        "department": "Corporate Administration",
        "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        "badge_id": "BIZ-SEC-99",
        "access_level": "System Administrator",
        "tag": "Compliance Lead"
    }
}

@app.get("/api/auth/demo-credentials")
def get_demo_credentials():
    """Return verified demo credential profiles with email, role, and passwords"""
    return [
        {
            "id": idx + 1,
            "email": email,
            "password": cred["password"],
            "name": cred["name"],
            "role": cred["role"],
            "department": cred["department"],
            "avatar": cred["avatar_url"],
            "badgeId": cred["badge_id"],
            "accessLevel": cred["access_level"],
            "tag": cred["tag"]
        }
        for idx, (email, cred) in enumerate(DEMO_CREDENTIALS.items())
    ]

@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate business user with real credential and password validation"""
    email_clean = (req.email or "").strip().lower()
    password_input = (req.password or "").strip()

    if not email_clean:
        raise HTTPException(status_code=400, detail="Work email address is required.")
    
    if not password_input:
        raise HTTPException(
            status_code=401,
            detail="Invalid password. Please enter a password or use the demo credentials below."
        )

    matched_demo = DEMO_CREDENTIALS.get(email_clean)
    emp = db.query(Employee).filter(Employee.email.ilike(email_clean)).first()

    if not matched_demo and not emp:
        raise HTTPException(
            status_code=401,
            detail="Invalid email address. No registered user found. Please use the verified demo credentials below."
        )

    # Determine expected password: demo password or employee default password
    expected_password = matched_demo["password"] if matched_demo else "shiftwise2026!"

    # Real password verification
    if password_input != expected_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid password. Please check your password or use the verified demo credentials below."
        )

    # Resolve user attributes
    name = matched_demo["name"] if matched_demo else emp.name
    role = req.role if req.role else (matched_demo["role"] if matched_demo else emp.role)
    dept = req.department if req.department else (matched_demo["department"] if matched_demo else emp.department)
    avatar = matched_demo["avatar_url"] if matched_demo else (emp.avatar_url or "/static/assets/druvith_raj.jpg")
    badge_id = matched_demo["badge_id"] if matched_demo else f"MH-{emp.id:04d}"

    log = ActivityLog(
        action_type="user_login",
        description=f"{name} ({role}) successfully authenticated into ShiftWise Business Operations Portal.",
        severity="info"
    )
    db.add(log)
    db.commit()

    return {
        "success": True,
        "token": f"jwt_mh_{int(datetime.utcnow().timestamp())}",
        "user": {
            "id": emp.id if emp else (1 if "druvith" in email_clean else 99),
            "name": name,
            "email": email_clean,
            "role": role,
            "department": dept,
            "avatar_url": avatar,
            "badge_id": badge_id
        }
    }

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Executive KPI Dashboard statistics"""
    settings = get_system_settings(db)
    employees = db.query(Employee).all()
    shifts = db.query(Shift).filter(Shift.status != "cancelled").all()
    assignments = db.query(ShiftAssignment).all()
    
    total_required = sum(s.required_headcount for s in shifts)
    total_assigned = len(assignments)
    
    # Calculate gap shifts
    gap_shifts_count = 0
    short_shifts = []
    for s in shifts:
        assigned = sum(1 for a in assignments if a.shift_id == s.id)
        if assigned < s.required_headcount:
            gap_shifts_count += (s.required_headcount - assigned)
            short_shifts.append({
                "id": s.id,
                "title": s.title,
                "department": s.department,
                "role_required": s.role_required,
                "start_time": s.start_time.isoformat(),
                "end_time": s.end_time.isoformat(),
                "assigned": assigned,
                "required": s.required_headcount,
                "missing": s.required_headcount - assigned
            })

    conflicts = detect_conflicts(db)
    critical_conflicts = sum(1 for c in conflicts if c["severity"] == "critical")
    resilience = calculate_resilience_score(db)
    burnout_risks = sum(1 for e in employees if e.fatigue_score >= 50.0)

    return {
        "hospital_name": settings.hospital_name,
        "emergency_mode": settings.emergency_mode,
        "min_rest_hours": settings.min_rest_hours,
        "max_weekly_hours": settings.max_weekly_hours,
        "total_employees": len(employees),
        "active_employees": sum(1 for e in employees if e.status == "Active"),
        "reserve_employees": sum(1 for e in employees if e.status == "Reserve"),
        "total_shifts": len(shifts),
        "total_required_slots": total_required,
        "total_assigned_slots": total_assigned,
        "coverage_percentage": round((total_assigned / total_required * 100), 1) if total_required > 0 else 100.0,
        "total_gaps": gap_shifts_count,
        "short_shifts": short_shifts[:5],
        "conflicts_count": len(conflicts),
        "critical_conflicts_count": critical_conflicts,
        "burnout_risk_count": burnout_risks,
        "resilience": resilience,
        "last_repaired_at": settings.last_repaired_at.isoformat() if settings.last_repaired_at else None
    }


@app.get("/api/dashboard/resilience")
def get_resilience_details(db: Session = Depends(get_db)):
    """Schedule Resilience Score with breakdown metrics and risk hotspots"""
    return calculate_resilience_score(db)


@app.get("/api/dashboard/heatmap")
def get_skill_coverage_heatmap(db: Session = Depends(get_db)):
    """Skill Coverage Heatmap: Department/Shift vs Critical Competencies"""
    return generate_skill_heatmap(db)


@app.get("/api/conflicts")
def get_all_conflicts(db: Session = Depends(get_db)):
    """Real-time conflict and compliance scanner"""
    return detect_conflicts(db)


@app.post("/api/shifts/auto-assign")
def trigger_auto_assignment(db: Session = Depends(get_db)):
    """Automatic intelligent assignment algorithm"""
    result = auto_assign_shifts(db)
    return result


@app.post("/api/shifts/repair")
def trigger_schedule_repair(db: Session = Depends(get_db)):
    """WOW Feature: One-Click Schedule Repair"""
    result = repair_schedule(db)
    return result


@app.get("/api/shifts")
def list_shifts(
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve all shifts with assignments, vacancy status, and details"""
    query = db.query(Shift).filter(Shift.status != "cancelled")
    if department and department != "All":
        query = query.filter(Shift.department == department)
    if status and status != "All":
        query = query.filter(Shift.status == status)
    
    shifts = query.order_by(Shift.start_time).all()
    output = []
    
    for s in shifts:
        assignments = db.query(ShiftAssignment).filter(ShiftAssignment.shift_id == s.id).all()
        assigned_list = []
        for a in assignments:
            emp = db.query(Employee).filter(Employee.id == a.employee_id).first()
            if emp:
                assigned_list.append({
                    "id": a.id,
                    "shift_id": s.id,
                    "employee_id": emp.id,
                    "employee_name": emp.name,
                    "employee_role": emp.role,
                    "avatar_url": emp.avatar_url,
                    "status": a.status,
                    "conflict_notes": a.conflict_notes,
                    "assigned_at": a.assigned_at.isoformat()
                })
        
        output.append({
            "id": s.id,
            "title": s.title,
            "department": s.department,
            "role_required": s.role_required,
            "start_time": s.start_time.isoformat(),
            "end_time": s.end_time.isoformat(),
            "duration_hours": s.duration_hours,
            "required_headcount": s.required_headcount,
            "assigned_count": len(assigned_list),
            "is_short": len(assigned_list) < s.required_headcount,
            "missing_count": max(0, s.required_headcount - len(assigned_list)),
            "demand_level": s.demand_level,
            "status": s.status,
            "notes": s.notes,
            "required_skills": s.required_skills,
            "required_certifications": s.required_certifications,
            "assignments": assigned_list
        })
    return output


@app.post("/api/shifts")
def create_shift(data: ShiftCreate, db: Session = Depends(get_db)):
    """Create a new operational shift"""
    shift = Shift(
        title=data.title,
        department=data.department,
        role_required=data.role_required,
        start_time=data.start_time,
        end_time=data.end_time,
        required_headcount=data.required_headcount,
        demand_level=data.demand_level or "normal",
        status=data.status or "published",
        notes=data.notes or ""
    )
    shift.required_skills = data.required_skills or []
    shift.required_certifications = data.required_certifications or []
    db.add(shift)
    db.commit()
    db.refresh(shift)
    
    # Log
    log = ActivityLog(
        action_type="shift_created",
        description=f"New shift created: '{shift.title}' in {shift.department} (Needs {shift.required_headcount} {shift.role_required}).",
        severity="info"
    )
    db.add(log)
    db.commit()

    return {"message": "Shift created successfully", "shift_id": shift.id}


@app.delete("/api/shifts/{shift_id}")
def delete_shift(shift_id: int, db: Session = Depends(get_db)):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    db.delete(shift)
    db.commit()
    return {"message": "Shift deleted successfully"}


@app.put("/api/shifts/{shift_id}")
def update_shift(shift_id: int, data: ShiftUpdate, notify_staff: bool = True, db: Session = Depends(get_db)):
    """Update operational shift details (headcount, skills, etc.) and auto-notify staff if skills/headcount change"""
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    old_headcount = shift.required_headcount
    old_skills = set(shift.required_skills)

    if data.title is not None: shift.title = data.title
    if data.department is not None: shift.department = data.department
    if data.role_required is not None: shift.role_required = data.role_required
    if data.start_time is not None: shift.start_time = data.start_time
    if data.end_time is not None: shift.end_time = data.end_time
    if data.required_headcount is not None: shift.required_headcount = data.required_headcount
    if data.demand_level is not None: shift.demand_level = data.demand_level
    if data.status is not None: shift.status = data.status
    if data.notes is not None: shift.notes = data.notes
    if data.required_skills is not None: shift.required_skills = data.required_skills
    if data.required_certifications is not None: shift.required_certifications = data.required_certifications

    db.commit()
    db.refresh(shift)

    notified_count = 0
    # Auto-dispatch notifications if headcount increased or new skills were added
    if notify_staff and (shift.required_headcount > old_headcount or set(shift.required_skills) != old_skills):
        dept_emps = db.query(Employee).filter(Employee.department == shift.department).all()
        if len(dept_emps) < shift.required_headcount:
            dept_emps = db.query(Employee).all()

        for emp in dept_emps:
            emp_skills = set(emp.skills)
            missing = [s for s in shift.required_skills if s not in emp_skills]
            if missing or shift.required_headcount >= 5:
                # Find matching course in academy
                target_sk = missing[0] if missing else (shift.required_skills[0] if shift.required_skills else "Six Sigma")
                course = db.query(SkillCourse).filter(SkillCourse.target_skill == target_sk).first()
                if not course and missing:
                    course = db.query(SkillCourse).first()

                notif = Notification(
                    employee_id=emp.id,
                    shift_id=shift.id,
                    title=f"Skill Upgrade Required: {shift.title} ({shift.required_headcount} People Needed)",
                    message=f"{emp.name} ({emp.role}): Headcount for '{shift.title}' increased to {shift.required_headcount}. Required skill: '{target_sk}'. Please complete certification in the Skill Academy to qualify.",
                    category="skill_upgrade",
                    target_skill=target_sk,
                    target_cert=course.target_cert if course else "",
                    course_id=course.id if course else None,
                    is_read=False,
                    created_at=datetime.utcnow()
                )
                db.add(notif)
                notified_count += 1

        log_msg = f"Shift '{shift.title}' updated: headcount increased to {shift.required_headcount}. Skill upgrade notifications dispatched to {notified_count} staff members."
        db.add(ActivityLog(action_type="shift_updated", description=log_msg, severity="warning" if shift.required_headcount >= 5 else "info"))
        db.commit()

    return {
        "message": "Shift updated successfully",
        "shift_id": shift.id,
        "required_headcount": shift.required_headcount,
        "notified_count": notified_count
    }


@app.post("/api/shifts/{shift_id}/notify-upgrade")
def dispatch_shift_skill_upgrade_notifications(shift_id: int, req: Optional[NotifyUpgradeRequest] = None, db: Session = Depends(get_db)):
    """Explicitly send skill upgrade notifications to staff for a shift (e.g. for 5-person shift requirements)"""
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    if req and req.target_headcount:
        shift.required_headcount = req.target_headcount
        db.commit()

    target_skills = req.target_skills if (req and req.target_skills) else shift.required_skills
    if not target_skills:
        target_skills = ["Six Sigma", "Logistics"]
        shift.required_skills = list(set(shift.required_skills + target_skills))
        db.commit()

    # Find staff in department or specified staff
    if req and req.employee_ids:
        target_emps = db.query(Employee).filter(Employee.id.in_(req.employee_ids)).all()
    else:
        target_emps = db.query(Employee).filter(Employee.department == shift.department).all()
        if len(target_emps) < shift.required_headcount:
            target_emps = db.query(Employee).all()

    notified_list = []
    for emp in target_emps:
        emp_skills = set(emp.skills)
        missing = [s for s in target_skills if s not in emp_skills]
        target_sk = missing[0] if missing else target_skills[0]
        matched_course = db.query(SkillCourse).filter(SkillCourse.target_skill == target_sk).first()
        if not matched_course:
            matched_course = db.query(SkillCourse).first()

        msg = (req.custom_message if req and req.custom_message else
               f"{emp.name} ({emp.role}): Shift '{shift.title}' has expanded to {shift.required_headcount} personnel. You are requested to upgrade your skills in '{target_sk}' via '{matched_course.title if matched_course else 'Skill Academy'}' to qualify.")

        notif = Notification(
            employee_id=emp.id,
            shift_id=shift.id,
            title=f"Skill Upgrade Notification: {shift.title} ({shift.required_headcount} People Needed)",
            message=msg,
            category="skill_upgrade",
            target_skill=target_sk,
            target_cert=matched_course.target_cert if matched_course else "",
            course_id=matched_course.id if matched_course else None,
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.add(notif)
        notified_list.append({
            "employee_id": emp.id,
            "employee_name": emp.name,
            "employee_role": emp.role,
            "skill": target_sk,
            "course_title": matched_course.title if matched_course else None
        })

    log = ActivityLog(
        action_type="skill_notifications_sent",
        description=f"Skill upgrade notifications sent to {len(notified_list)} staff members for shift '{shift.title}' (Needs {shift.required_headcount} people).",
        severity="warning"
    )
    db.add(log)
    db.commit()

    return {
        "success": True,
        "shift_id": shift.id,
        "shift_title": shift.title,
        "required_headcount": shift.required_headcount,
        "notified_count": len(notified_list),
        "notified_staff": notified_list
    }



@app.post("/api/shifts/assign")
def assign_employee_to_shift(req: AssignRequest, db: Session = Depends(get_db)):
    """Assign an employee to a shift"""
    shift = db.query(Shift).filter(Shift.id == req.shift_id).first()
    emp = db.query(Employee).filter(Employee.id == req.employee_id).first()
    if not shift or not emp:
        raise HTTPException(status_code=404, detail="Shift or Employee not found")

    existing = db.query(ShiftAssignment).filter(
        ShiftAssignment.shift_id == req.shift_id,
        ShiftAssignment.employee_id == req.employee_id
    ).first()
    if existing:
        return {"message": "Employee already assigned to this shift"}

    assignment = ShiftAssignment(
        shift_id=req.shift_id,
        employee_id=req.employee_id,
        status="confirmed"
    )
    db.add(assignment)
    
    # Update cached hours & fatigue
    emp.current_weekly_hours = get_employee_weekly_hours(db, emp.id) + shift.duration_hours
    emp.fatigue_score = min(100.0, emp.fatigue_score + (shift.duration_hours * 2.0))
    
    db.commit()
    return {"message": "Assignment confirmed successfully"}


@app.delete("/api/shifts/unassign/{assignment_id}")
def unassign_employee(assignment_id: int, db: Session = Depends(get_db)):
    assignment = db.query(ShiftAssignment).filter(ShiftAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    emp = db.query(Employee).filter(Employee.id == assignment.employee_id).first()
    shift = db.query(Shift).filter(Shift.id == assignment.shift_id).first()
    
    db.delete(assignment)
    db.commit()
    
    if emp and shift:
        emp.current_weekly_hours = max(0.0, get_employee_weekly_hours(db, emp.id))
        emp.fatigue_score = max(0.0, emp.fatigue_score - 5.0)
        db.commit()

    return {"message": "Assignment removed"}


@app.get("/api/shifts/{shift_id}/replacements")
def get_replacements_for_shift(shift_id: int, db: Session = Depends(get_db)):
    """Top candidate recommendations with compatibility scores"""
    return get_replacement_candidates(db, shift_id)


@app.get("/api/employees")
def list_employees(department: Optional[str] = None, db: Session = Depends(get_db)):
    """List all employees with qualifications, hours, and fatigue"""
    query = db.query(Employee)
    if department and department != "All":
        query = query.filter(Employee.department == department)
    
    employees = query.all()
    output = []
    for e in employees:
        output.append({
            "id": e.id,
            "name": e.name,
            "email": e.email,
            "phone": e.phone,
            "role": e.role,
            "department": e.department,
            "hourly_rate": e.hourly_rate,
            "max_weekly_hours": e.max_weekly_hours,
            "current_weekly_hours": round(get_employee_weekly_hours(db, e.id), 1),
            "fatigue_score": round(e.fatigue_score, 1),
            "status": e.status,
            "avatar_url": e.avatar_url,
            "skills": e.skills,
            "certifications": e.certifications,
            "availability": e.availability
        })
    return output


@app.post("/api/employees")
def create_employee(data: EmployeeCreate, db: Session = Depends(get_db)):
    """Add a new employee to roster"""
    emp = Employee(
        name=data.name,
        email=data.email,
        phone=data.phone or "",
        role=data.role,
        department=data.department,
        hourly_rate=data.hourly_rate or 35.0,
        max_weekly_hours=data.max_weekly_hours or 40.0,
        current_weekly_hours=0.0,
        fatigue_score=15.0,
        status=data.status or "Active",
        avatar_url=data.avatar_url or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    )
    emp.skills = data.skills or []
    emp.certifications = data.certifications or []
    emp.availability = data.availability or {}
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return {"message": "Employee created successfully", "employee_id": emp.id}


@app.delete("/api/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return {"message": "Employee removed"}


@app.post("/api/simulator/run")
def run_simulation(req: SimulatorRequest, db: Session = Depends(get_db)):
    """What-If Scheduling Simulator Engine"""
    return run_what_if_simulation(
        db,
        scenario=req.scenario,
        affected_dept=req.affected_department or "All",
        sick_ids=req.sick_employee_ids or [],
        surge_mult=req.surge_multiplier or 1.5
    )


@app.post("/api/swaps/check")
def check_swap(req: SwapCheckRequest, db: Session = Depends(get_db)):
    """Check swap compatibility between two employees"""
    return check_swap_compatibility(
        db,
        requester_id=req.requester_id,
        target_employee_id=req.target_employee_id,
        shift_id=req.shift_id,
        target_shift_id=req.target_shift_id
    )


@app.get("/api/swaps")
def list_swaps(db: Session = Depends(get_db)):
    """List pending and approved shift swaps"""
    swaps = db.query(SwapRequest).order_by(SwapRequest.created_at.desc()).all()
    output = []
    for s in swaps:
        emp1 = db.query(Employee).filter(Employee.id == s.requester_id).first()
        emp2 = db.query(Employee).filter(Employee.id == s.target_employee_id).first()
        sh1 = db.query(Shift).filter(Shift.id == s.shift_id).first()
        sh2 = db.query(Shift).filter(Shift.id == s.target_shift_id).first() if s.target_shift_id else None

        output.append({
            "id": s.id,
            "requester_id": s.requester_id,
            "requester_name": emp1.name if emp1 else "Unknown",
            "target_employee_id": s.target_employee_id,
            "target_employee_name": emp2.name if emp2 else "Unknown",
            "shift_id": s.shift_id,
            "shift_title": sh1.title if sh1 else "Shift",
            "shift_time": f"{sh1.start_time.strftime('%a %H:%M')}" if sh1 else "",
            "target_shift_id": s.target_shift_id,
            "target_shift_title": sh2.title if sh2 else "Open Cover",
            "status": s.status,
            "compatibility_score": s.compatibility_score,
            "compatibility_analysis": s.compatibility_analysis,
            "created_at": s.created_at.isoformat()
        })
    return output


@app.post("/api/swaps/request")
def request_swap(req: SwapCreateRequest, db: Session = Depends(get_db)):
    """Create a new swap request"""
    eval_res = check_swap_compatibility(
        db,
        requester_id=req.requester_id,
        target_employee_id=req.target_employee_id,
        shift_id=req.shift_id,
        target_shift_id=req.target_shift_id
    )

    swap = SwapRequest(
        requester_id=req.requester_id,
        target_employee_id=req.target_employee_id,
        shift_id=req.shift_id,
        target_shift_id=req.target_shift_id,
        status="pending",
        compatibility_score=eval_res["score"]
    )
    swap.compatibility_analysis = eval_res["strengths"] + eval_res["issues"]
    db.add(swap)
    db.commit()
    db.refresh(swap)
    return {"message": "Swap request submitted", "swap_id": swap.id, "compatibility": eval_res}


@app.post("/api/swaps/{swap_id}/approve")
def approve_swap(swap_id: int, db: Session = Depends(get_db)):
    """Approve and execute shift swap"""
    swap = db.query(SwapRequest).filter(SwapRequest.id == swap_id).first()
    if not swap:
        raise HTTPException(status_code=404, detail="Swap request not found")

    # Reassign shift 1 to target_employee
    assign1 = db.query(ShiftAssignment).filter(
        ShiftAssignment.shift_id == swap.shift_id,
        ShiftAssignment.employee_id == swap.requester_id
    ).first()
    if assign1:
        assign1.employee_id = swap.target_employee_id

    # If mutual swap, reassign shift 2 to requester
    if swap.target_shift_id:
        assign2 = db.query(ShiftAssignment).filter(
            ShiftAssignment.shift_id == swap.target_shift_id,
            ShiftAssignment.employee_id == swap.target_employee_id
        ).first()
        if assign2:
            assign2.employee_id = swap.requester_id

    swap.status = "approved"
    
    log = ActivityLog(
        action_type="swap_approved",
        description=f"Shift swap #{swap.id} approved and executed.",
        severity="success"
    )
    db.add(log)
    db.commit()
    return {"message": "Swap approved and schedule updated"}


@app.get("/api/courses")
def list_courses(employee_id: Optional[int] = None, db: Session = Depends(get_db)):
    """List Skill Upgrade courses with employee enrollment status"""
    courses = db.query(SkillCourse).all()
    output = []
    for c in courses:
        enrollment = None
        if employee_id:
            enrollment = db.query(CourseEnrollment).filter(
                CourseEnrollment.course_id == c.id,
                CourseEnrollment.employee_id == employee_id
            ).first()

        output.append({
            "id": c.id,
            "title": c.title,
            "category": c.category,
            "target_skill": c.target_skill,
            "target_cert": c.target_cert,
            "description": c.description,
            "duration_hours": c.duration_hours,
            "modules_count": c.modules_count,
            "enrolled_count": c.enrolled_count,
            "level": c.level,
            "enrolled": enrollment is not None,
            "progress": enrollment.progress if enrollment else 0.0,
            "completed": enrollment.status == "completed" if enrollment else False
        })
    return output


@app.post("/api/courses/complete")
def complete_course(req: CourseCompleteRequest, db: Session = Depends(get_db)):
    """
    WOW Feature: Skill & Certification Upgrade!
    Completing a course instantly adds the skill & certificate to the employee,
    immediately qualifying them for higher-demand shifts!
    """
    course = db.query(SkillCourse).filter(SkillCourse.id == req.course_id).first()
    emp = db.query(Employee).filter(Employee.id == req.employee_id).first()
    if not course or not emp:
        raise HTTPException(status_code=404, detail="Course or Employee not found")

    # Update or create enrollment
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == req.course_id,
        CourseEnrollment.employee_id == req.employee_id
    ).first()
    if not enrollment:
        enrollment = CourseEnrollment(
            employee_id=req.employee_id,
            course_id=req.course_id,
            progress=100.0,
            status="completed",
            completed_at=datetime.utcnow()
        )
        db.add(enrollment)
        course.enrolled_count += 1
    else:
        enrollment.progress = 100.0
        enrollment.status = "completed"
        enrollment.completed_at = datetime.utcnow()

    # Grant Skill
    current_skills = list(emp.skills)
    if course.target_skill not in current_skills:
        current_skills.append(course.target_skill)
        emp.skills = current_skills

    # Grant Certificate if provided
    if course.target_cert:
        current_certs = list(emp.certifications)
        cert_names = [c.get("name") for c in current_certs]
        if course.target_cert not in cert_names:
            current_certs.append({
                "name": course.target_cert,
                "code": f"{course.target_cert}-{random.randint(1000, 9999)}",
                "expiry": (datetime.utcnow() + timedelta(days=365)).strftime("%Y-%m-%d"),
                "status": "Active"
            })
            emp.certifications = current_certs

    # Auto-resolve unread notifications for this employee and skill
    notifs = db.query(Notification).filter(
        Notification.employee_id == req.employee_id,
        Notification.target_skill == course.target_skill,
        Notification.is_read == False
    ).all()
    for n in notifs:
        n.is_read = True

    log = ActivityLog(
        action_type="course_completed",
        description=f"{emp.name} completed '{course.title}'! Granted skill '{course.target_skill}' and certification '{course.target_cert}'.",
        severity="success"
    )
    db.add(log)
    db.commit()

    return {
        "success": True,
        "message": f"Course completed! {emp.name} now holds certified skill: {course.target_skill}",
        "new_skills": emp.skills,
        "new_certifications": emp.certifications
    }


@app.post("/api/settings/emergency")
def toggle_emergency_mode(db: Session = Depends(get_db)):
    """WOW Feature: One-Click Emergency Mode Toggle"""
    settings = get_system_settings(db)
    settings.emergency_mode = not settings.emergency_mode
    db.commit()

    # Log
    state = "ACTIVATED" if settings.emergency_mode else "DEACTIVATED"
    log = ActivityLog(
        action_type="emergency_toggled",
        description=f"DISASTER / EMERGENCY MODE {state}. Work hour limits relaxed to 56h, reserve pool activated.",
        severity="critical" if settings.emergency_mode else "info"
    )
    db.add(log)
    db.commit()

    return {
        "emergency_mode": settings.emergency_mode,
        "message": f"Emergency Mode is now {'ACTIVE' if settings.emergency_mode else 'OFF'}"
    }


@app.get("/api/activity")
def get_activity_logs(limit: int = 15, db: Session = Depends(get_db)):
    """Real-time activity logs"""
    logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "action_type": l.action_type,
            "description": l.description,
            "severity": l.severity,
            "timestamp": l.timestamp.strftime("%H:%M:%S")
        }
        for l in logs
    ]


@app.get("/api/notifications")
def list_notifications(unread_only: bool = False, limit: int = 25, db: Session = Depends(get_db)):
    """Retrieve notifications (skill upgrades, staffing alerts, etc.)"""
    query = db.query(Notification)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    notifs = query.order_by(Notification.created_at.desc()).limit(limit).all()
    output = []
    for n in notifs:
        emp = db.query(Employee).filter(Employee.id == n.employee_id).first() if n.employee_id else None
        shift = db.query(Shift).filter(Shift.id == n.shift_id).first() if n.shift_id else None
        course = db.query(SkillCourse).filter(SkillCourse.id == n.course_id).first() if n.course_id else None
        output.append({
            "id": n.id,
            "employee_id": n.employee_id,
            "employee_name": emp.name if emp else "All Personnel",
            "employee_role": emp.role if emp else "",
            "avatar_url": emp.avatar_url if emp else "",
            "shift_id": n.shift_id,
            "shift_title": shift.title if shift else "",
            "title": n.title,
            "message": n.message,
            "category": n.category,
            "target_skill": n.target_skill,
            "target_cert": n.target_cert,
            "course_id": n.course_id,
            "course_title": course.title if course else "",
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else datetime.utcnow().isoformat()
        })
    return output


@app.post("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    """Mark single notification as read"""
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read", "id": notification_id}


@app.post("/api/notifications/read-all")
def mark_all_notifications_read(db: Session = Depends(get_db)):
    """Mark all notifications as read"""
    db.query(Notification).update({Notification.is_read: True})
    db.commit()
    return {"message": "All notifications marked as read"}



@app.post("/api/system/reset")
def reset_system(db: Session = Depends(get_db)):
    """Reset and reseed database for demo purposes"""
    seed_database(db, force=True)
    return {"message": "Database reset and reseeded with default demo data."}


# Mount Static Frontend
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))


if __name__ == "__main__":
    import uvicorn
    print("=" * 65)
    print("  [*] ShiftWise - Business-Based Shift Management System")
    print("  Problem Statement 36 | Team CODESPRINT (CBC052)")
    print("=" * 65)
    print("  Serving Web App at:       http://localhost:8000")
    print("  Interactive Swagger Docs: http://localhost:8000/docs")
    print("=" * 65)
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)

