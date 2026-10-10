"""
ShiftWise Pydantic Schemas for validation and serialization
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Authentication Schemas
class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None
    role: Optional[str] = "Business Operations Director"
    department: Optional[str] = "All Units"

# Employee Schemas
class EmployeeBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    role: str
    department: str
    hourly_rate: Optional[float] = 35.0
    max_weekly_hours: Optional[float] = 40.0
    skills: Optional[List[str]] = []
    certifications: Optional[List[Dict[str, Any]]] = []
    availability: Optional[Dict[str, List[str]]] = {}
    avatar_url: Optional[str] = ""
    status: Optional[str] = "Active"

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    hourly_rate: Optional[float] = None
    max_weekly_hours: Optional[float] = None
    skills: Optional[List[str]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    availability: Optional[Dict[str, List[str]]] = None
    status: Optional[str] = None
    fatigue_score: Optional[float] = None

class EmployeeOut(EmployeeBase):
    id: int
    current_weekly_hours: float
    fatigue_score: float

    class Config:
        from_attributes = True

# Shift Schemas
class ShiftBase(BaseModel):
    title: str
    department: str
    role_required: str
    start_time: datetime
    end_time: datetime
    required_headcount: int = 1
    demand_level: Optional[str] = "normal"
    status: Optional[str] = "published"
    notes: Optional[str] = ""
    required_skills: Optional[List[str]] = []
    required_certifications: Optional[List[str]] = []

class ShiftCreate(ShiftBase):
    pass

class ShiftUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    role_required: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    required_headcount: Optional[int] = None
    demand_level: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    required_skills: Optional[List[str]] = None
    required_certifications: Optional[List[str]] = None

class ShiftAssignmentOut(BaseModel):
    id: int
    shift_id: int
    employee_id: int
    employee_name: str
    employee_role: str
    avatar_url: str
    status: str
    conflict_notes: Optional[str] = ""
    assigned_at: datetime

class ShiftOut(ShiftBase):
    id: int
    duration_hours: float
    assigned_count: int
    is_short: bool
    assignments: List[ShiftAssignmentOut] = []

    class Config:
        from_attributes = True

# Assignment Action
class AssignRequest(BaseModel):
    shift_id: int
    employee_id: int

# Swap Check & Request
class SwapCheckRequest(BaseModel):
    requester_id: int
    target_employee_id: int
    shift_id: int
    target_shift_id: Optional[int] = None

class SwapCreateRequest(BaseModel):
    requester_id: int
    target_employee_id: int
    shift_id: int
    target_shift_id: Optional[int] = None

# Simulator Request
class SimulatorRequest(BaseModel):
    scenario: str # "flu_wave", "surge_demand", "lead_absence", "custom"
    affected_department: Optional[str] = "All"
    sick_employee_ids: Optional[List[int]] = []
    surge_multiplier: Optional[float] = 1.5

# Course Enrollment / Complete
class CourseCompleteRequest(BaseModel):
    employee_id: int
    course_id: int

# Settings
class SettingsUpdate(BaseModel):
    emergency_mode: Optional[bool] = None
    min_rest_hours: Optional[float] = None
    max_weekly_hours: Optional[float] = None

# Notification Schemas
class NotifyUpgradeRequest(BaseModel):
    shift_id: int
    target_skills: Optional[List[str]] = None
    target_headcount: Optional[int] = None
    employee_ids: Optional[List[int]] = None
    custom_message: Optional[str] = None

class NotificationCreate(BaseModel):
    employee_id: Optional[int] = None
    shift_id: Optional[int] = None
    title: str
    message: str
    category: Optional[str] = "skill_upgrade"
    target_skill: Optional[str] = ""
    target_cert: Optional[str] = ""
    course_id: Optional[int] = None

class NotificationOut(BaseModel):
    id: int
    employee_id: Optional[int] = None
    employee_name: Optional[str] = None
    employee_role: Optional[str] = None
    avatar_url: Optional[str] = None
    shift_id: Optional[int] = None
    shift_title: Optional[str] = None
    title: str
    message: str
    category: str
    target_skill: Optional[str] = ""
    target_cert: Optional[str] = ""
    course_id: Optional[int] = None
    course_title: Optional[str] = None
    is_read: bool
    created_at: str

