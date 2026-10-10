"""
ShiftWise Data Models (SQLAlchemy ORM)
Handles Employees, Shifts, Assignments, Swaps, Compliance, Courses & Settings
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
import json
from .database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(30), default="")
    role = Column(String(50), nullable=False)  # e.g., Senior Nurse, Triage Specialist, ER Physician
    department = Column(String(50), nullable=False) # e.g., Emergency, Intensive Care, Pediatrics, Surgery
    hourly_rate = Column(Float, default=35.0)
    max_weekly_hours = Column(Float, default=40.0)
    current_weekly_hours = Column(Float, default=0.0)
    fatigue_score = Column(Float, default=15.0)  # 0 to 100
    status = Column(String(20), default="Active") # Active, On Leave, Reserve, Quarantined
    avatar_url = Column(String(255), default="")
    
    # JSON strings
    skills_json = Column(Text, default="[]") # ["ICU Care", "Triage", "BLS", "CPR"]
    certifications_json = Column(Text, default="[]") # [{"name": "BLS", "code": "BLS-2024", "expiry": "2026-12-31", "status": "Active"}]
    availability_json = Column(Text, default="{}") # {"monday": ["08:00-20:00"], "tuesday": ...}

    # Relationships
    assignments = relationship("ShiftAssignment", back_populates="employee", cascade="all, delete-orphan")
    absences = relationship("AbsenceRecord", back_populates="employee", cascade="all, delete-orphan")
    enrollments = relationship("CourseEnrollment", back_populates="employee", cascade="all, delete-orphan")

    @property
    def skills(self):
        try:
            return json.loads(self.skills_json) if self.skills_json else []
        except Exception:
            return []

    @skills.setter
    def skills(self, value):
        self.skills_json = json.dumps(value)

    @property
    def certifications(self):
        try:
            return json.loads(self.certifications_json) if self.certifications_json else []
        except Exception:
            return []

    @certifications.setter
    def certifications(self, value):
        self.certifications_json = json.dumps(value)

    @property
    def availability(self):
        try:
            return json.loads(self.availability_json) if self.availability_json else {}
        except Exception:
            return {}

    @availability.setter
    def availability(self, value):
        self.availability_json = json.dumps(value)


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    department = Column(String(50), nullable=False)
    role_required = Column(String(50), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    required_headcount = Column(Integer, default=1)
    demand_level = Column(String(20), default="normal") # low, normal, high, surge
    status = Column(String(20), default="published") # draft, published, completed, cancelled
    notes = Column(Text, default="")
    
    # JSON strings
    required_skills_json = Column(Text, default="[]")
    required_certifications_json = Column(Text, default="[]")

    # Relationships
    assignments = relationship("ShiftAssignment", back_populates="shift", cascade="all, delete-orphan")

    @property
    def required_skills(self):
        try:
            return json.loads(self.required_skills_json) if self.required_skills_json else []
        except Exception:
            return []

    @required_skills.setter
    def required_skills(self, value):
        self.required_skills_json = json.dumps(value)

    @property
    def required_certifications(self):
        try:
            return json.loads(self.required_certifications_json) if self.required_certifications_json else []
        except Exception:
            return []

    @required_certifications.setter
    def required_certifications(self, value):
        self.required_certifications_json = json.dumps(value)

    @property
    def duration_hours(self):
        if self.start_time and self.end_time:
            delta = self.end_time - self.start_time
            return max(0.0, delta.total_seconds() / 3600.0)
        return 0.0


class ShiftAssignment(Base):
    __tablename__ = "shift_assignments"

    id = Column(Integer, primary_key=True, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="confirmed") # confirmed, pending_swap, conflict_flagged
    conflict_notes = Column(Text, default="")

    shift = relationship("Shift", back_populates="assignments")
    employee = relationship("Employee", back_populates="assignments")


class AbsenceRecord(Base):
    __tablename__ = "absence_records"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    reason = Column(String(255), nullable=False) # Sickness, Emergency Leave, Vacation, Training
    status = Column(String(20), default="approved") # pending, approved, rejected

    employee = relationship("Employee", back_populates="absences")


class SwapRequest(Base):
    __tablename__ = "swap_requests"

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    target_employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=False)
    target_shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=True)
    status = Column(String(20), default="pending") # pending, approved, rejected
    compatibility_score = Column(Float, default=100.0) # 0 to 100
    compatibility_analysis_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    requester = relationship("Employee", foreign_keys=[requester_id])
    target_employee = relationship("Employee", foreign_keys=[target_employee_id])
    shift = relationship("Shift", foreign_keys=[shift_id])
    target_shift = relationship("Shift", foreign_keys=[target_shift_id])

    @property
    def compatibility_analysis(self):
        try:
            return json.loads(self.compatibility_analysis_json) if self.compatibility_analysis_json else []
        except Exception:
            return []

    @compatibility_analysis.setter
    def compatibility_analysis(self, value):
        self.compatibility_analysis_json = json.dumps(value)


class SkillCourse(Base):
    __tablename__ = "skill_courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(50), default="Clinical") # Clinical, Safety, Leadership, Technical
    target_skill = Column(String(50), nullable=False) # e.g. "Advanced Trauma"
    target_cert = Column(String(50), default="") # e.g. "ATLS-Certified"
    description = Column(Text, default="")
    duration_hours = Column(Float, default=4.0)
    modules_count = Column(Integer, default=5)
    enrolled_count = Column(Integer, default=0)
    level = Column(String(20), default="Intermediate")

    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("skill_courses.id", ondelete="CASCADE"), nullable=False)
    progress = Column(Float, default=0.0) # 0 to 100
    status = Column(String(20), default="in_progress") # in_progress, completed
    completed_at = Column(DateTime, nullable=True)

    employee = relationship("Employee", back_populates="enrollments")
    course = relationship("SkillCourse", back_populates="enrollments")


class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    hospital_name = Column(String(100), default="ShiftWise Enterprise Business Operations")
    emergency_mode = Column(Boolean, default=False)
    min_rest_hours = Column(Float, default=11.0)
    max_weekly_hours = Column(Float, default=40.0)
    emergency_max_hours = Column(Float, default=56.0)
    auto_repair_enabled = Column(Boolean, default=True)
    last_repaired_at = Column(DateTime, nullable=True)


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String(50), nullable=False) # assignment, conflict_detected, repaired, emergency_toggled, swap_approved, course_completed
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="info") # info, success, warning, critical
    timestamp = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=True)
    shift_id = Column(Integer, ForeignKey("shifts.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="skill_upgrade") # skill_upgrade, staffing_gap, system
    target_skill = Column(String(50), default="")
    target_cert = Column(String(50), default="")
    course_id = Column(Integer, ForeignKey("skill_courses.id", ondelete="SET NULL"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee")
    shift = relationship("Shift")
    course = relationship("SkillCourse")

