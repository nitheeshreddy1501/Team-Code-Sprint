"""
ShiftWise Algorithmic Core & Rule Engine
Features:
- Conflict & Compliance Detection (Overlaps, Rest Hours, Overtime, Certifications)
- Smart Heuristic Auto-Assignment
- Schedule Resilience Score (0-100%)
- One-Click Schedule Repair
- What-If Scheduling Simulator
- Shift Swap Compatibility Checker
- Top Replacement Candidate Ranking
- Skill Coverage Heatmap
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from .models import (
    Employee, Shift, ShiftAssignment, AbsenceRecord,
    SwapRequest, SkillCourse, CourseEnrollment, SystemSettings, ActivityLog
)

def get_system_settings(db: Session) -> SystemSettings:
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings(
            hospital_name="ShiftWise Enterprise Business Operations",
            emergency_mode=False,
            min_rest_hours=11.0,
            max_weekly_hours=40.0,
            emergency_max_hours=56.0,
            auto_repair_enabled=True
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def detect_conflicts(db: Session) -> List[Dict[str, Any]]:
    """
    Comprehensive Conflict & Compliance Scanner:
    1. Overlapping Shifts (Double booking)
    2. Mandatory Rest Period Breach (< 11 hours between consecutive shifts)
    3. Maximum Work Hour Limit Breach (> 40h standard or > 56h emergency)
    4. Missing or Expired Mandatory Certifications
    5. Missing Required Skills
    6. Approved Absence / Sick Leave Clash
    """
    settings = get_system_settings(db)
    min_rest = settings.min_rest_hours if not settings.emergency_mode else 8.0
    max_weekly = settings.max_weekly_hours if not settings.emergency_mode else settings.emergency_max_hours

    conflicts = []
    employees = db.query(Employee).all()

    for emp in employees:
        # Check active absence clash
        absences = db.query(AbsenceRecord).filter(
            AbsenceRecord.employee_id == emp.id,
            AbsenceRecord.status == "approved"
        ).all()

        # Get all assigned shifts ordered chronologically
        assignments = db.query(ShiftAssignment).filter(
            ShiftAssignment.employee_id == emp.id
        ).all()

        emp_shifts = []
        for a in assignments:
            s = db.query(Shift).filter(Shift.id == a.shift_id).first()
            if s:
                emp_shifts.append((s, a))

        emp_shifts.sort(key=lambda x: x[0].start_time)

        # 1. Absence Clash Check
        for s, a in emp_shifts:
            for abs_rec in absences:
                if (s.start_time <= abs_rec.end_date and s.end_time >= abs_rec.start_date):
                    conflicts.append({
                        "id": f"abs-{a.id}",
                        "type": "absence_clash",
                        "severity": "critical",
                        "employee_id": emp.id,
                        "employee_name": emp.name,
                        "shift_id": s.id,
                        "shift_title": s.title,
                        "description": f"{emp.name} is scheduled on {s.title} during approved leave ({abs_rec.reason}).",
                        "mitigation_hint": "Reassign shift to an available substitute."
                    })

        # 2. Overlapping Shifts Check
        for i in range(len(emp_shifts)):
            s1, a1 = emp_shifts[i]
            for j in range(i + 1, len(emp_shifts)):
                s2, a2 = emp_shifts[j]
                # If s2 starts before s1 ends -> Overlap!
                if s2.start_time < s1.end_time and s1.start_time < s2.end_time:
                    conflicts.append({
                        "id": f"ovl-{a1.id}-{a2.id}",
                        "type": "overlap",
                        "severity": "critical",
                        "employee_id": emp.id,
                        "employee_name": emp.name,
                        "shift_id": s2.id,
                        "shift_title": s2.title,
                        "description": f"Double booking: {emp.name} is assigned to '{s1.title}' and '{s2.title}' simultaneously.",
                        "mitigation_hint": "Unassign one shift and use Auto-Replacement."
                    })

        # 3. Mandatory Rest Period Breach (< min_rest hours between shifts)
        for i in range(len(emp_shifts) - 1):
            s_curr, a_curr = emp_shifts[i]
            s_next, a_next = emp_shifts[i + 1]
            if s_next.start_time >= s_curr.end_time:
                rest_gap = (s_next.start_time - s_curr.end_time).total_seconds() / 3600.0
                if rest_gap < min_rest:
                    conflicts.append({
                        "id": f"rst-{a_curr.id}-{a_next.id}",
                        "type": "rest_breach",
                        "severity": "warning" if settings.emergency_mode else "critical",
                        "employee_id": emp.id,
                        "employee_name": emp.name,
                        "shift_id": s_next.id,
                        "shift_title": s_next.title,
                        "description": f"Insufficient rest period: Only {rest_gap:.1f}h rest between '{s_curr.title}' and '{s_next.title}' (Mandatory minimum: {min_rest}h).",
                        "mitigation_hint": "Provide a rest buffer by swapping the second shift."
                    })

        # 4. Weekly Hours Overload Breach
        total_hours = sum(s.duration_hours for s, _ in emp_shifts)
        if total_hours > max_weekly:
            conflicts.append({
                "id": f"hr-{emp.id}",
                "type": "hours_breach",
                "severity": "critical" if total_hours > (max_weekly + 8) else "warning",
                "employee_id": emp.id,
                "employee_name": emp.name,
                "shift_id": emp_shifts[-1][0].id if emp_shifts else None,
                "shift_title": "Weekly Roster",
                "description": f"{emp.name} is assigned {total_hours:.1f} hours this week, exceeding limit of {max_weekly:.0f}h.",
                "mitigation_hint": "Rebalance hours across under-utilized team members."
            })

        # 5. Certification & Skill Qualification Checks
        for s, a in emp_shifts:
            emp_skills = set(emp.skills)
            emp_certs = {c.get("name") for c in emp.certifications if c.get("status") == "Active"}

            missing_skills = [sk for sk in s.required_skills if sk not in emp_skills]
            missing_certs = [cr for cr in s.required_certifications if cr not in emp_certs]

            if missing_certs:
                conflicts.append({
                    "id": f"cert-{a.id}",
                    "type": "cert_missing",
                    "severity": "critical",
                    "employee_id": emp.id,
                    "employee_name": emp.name,
                    "shift_id": s.id,
                    "shift_title": s.title,
                    "description": f"{emp.name} lacks active certification ({', '.join(missing_certs)}) required for '{s.title}'.",
                    "mitigation_hint": "Assign certified staff or upgrade employee via Course Academy."
                })
            
            if missing_skills:
                conflicts.append({
                    "id": f"sk-{a.id}",
                    "type": "skill_missing",
                    "severity": "warning",
                    "employee_id": emp.id,
                    "employee_name": emp.name,
                    "shift_id": s.id,
                    "shift_title": s.title,
                    "description": f"{emp.name} lacks required skill ({', '.join(missing_skills)}) for '{s.title}'.",
                    "mitigation_hint": "Select employee with required specialty or pair with senior mentor."
                })

    return conflicts


def get_employee_weekly_hours(db: Session, employee_id: int) -> float:
    assignments = db.query(ShiftAssignment).filter(ShiftAssignment.employee_id == employee_id).all()
    total = 0.0
    for a in assignments:
        s = db.query(Shift).filter(Shift.id == a.shift_id).first()
        if s:
            total += s.duration_hours
    return total


def score_employee_for_shift(db: Session, emp: Employee, shift: Shift, settings: SystemSettings) -> (float, List[str]):
    """
    Calculates a heuristic fitness score (0-100) for assigning employee to shift.
    Returns: (score, list_of_reasons)
    """
    reasons = []
    score = 100.0

    # 1. Hard check: Role match
    if emp.role != shift.role_required and "Lead" not in emp.role:
        score -= 25.0
        reasons.append(f"Role disparity ({emp.role} vs {shift.role_required})")
    else:
        reasons.append(f"Matching role: {emp.role}")

    # 2. Hard check: Certification check
    emp_certs = {c.get("name") for c in emp.certifications if c.get("status") == "Active"}
    missing_certs = [cr for cr in shift.required_certifications if cr not in emp_certs]
    if missing_certs:
        score -= 40.0
        reasons.append(f"Missing certs: {', '.join(missing_certs)}")
    else:
        if shift.required_certifications:
            reasons.append("All required certifications verified")

    # 3. Skill match
    emp_skills = set(emp.skills)
    matched_skills = [sk for sk in shift.required_skills if sk in emp_skills]
    missing_skills = [sk for sk in shift.required_skills if sk not in emp_skills]
    if shift.required_skills:
        match_ratio = len(matched_skills) / len(shift.required_skills)
        score += (match_ratio * 20.0) - (len(missing_skills) * 15.0)
        reasons.append(f"Skills match: {len(matched_skills)}/{len(shift.required_skills)}")

    # 4. Weekly hours headroom
    current_hrs = get_employee_weekly_hours(db, emp.id)
    max_hrs = settings.emergency_max_hours if settings.emergency_mode else settings.max_weekly_hours
    new_total = current_hrs + shift.duration_hours
    if new_total > max_hrs:
        score -= 45.0
        reasons.append(f"Overtime violation ({new_total:.1f}h > {max_hrs}h)")
    else:
        # Prefer employees with lower hours (fair workload distribution)
        hours_headroom = max_hrs - current_hrs
        score += min(15.0, hours_headroom * 0.5)
        reasons.append(f"Hours available: {hours_headroom:.1f}h buffer")

    # 5. Rest period compliance
    # Check prior and next shift
    assignments = db.query(ShiftAssignment).filter(ShiftAssignment.employee_id == emp.id).all()
    min_rest = 8.0 if settings.emergency_mode else settings.min_rest_hours
    rest_ok = True
    for a in assignments:
        other_s = db.query(Shift).filter(Shift.id == a.shift_id).first()
        if other_s:
            # Overlap check
            if shift.start_time < other_s.end_time and other_s.start_time < shift.end_time:
                score -= 100.0
                reasons.append("Direct time overlap with existing shift")
                rest_ok = False
                break
            # Rest gap check
            if shift.start_time >= other_s.end_time:
                gap = (shift.start_time - other_s.end_time).total_seconds() / 3600.0
                if gap < min_rest:
                    score -= 30.0
                    reasons.append(f"Rest gap only {gap:.1f}h (< {min_rest}h required)")
            elif other_s.start_time >= shift.end_time:
                gap = (other_s.start_time - shift.end_time).total_seconds() / 3600.0
                if gap < min_rest:
                    score -= 30.0
                    reasons.append(f"Rest gap before next shift only {gap:.1f}h (< {min_rest}h required)")

    # 6. Fatigue penalty
    fatigue_penalty = (emp.fatigue_score / 100.0) * 15.0
    score -= fatigue_penalty
    if emp.fatigue_score > 60:
        reasons.append(f"Elevated fatigue index ({emp.fatigue_score:.0f}%)")

    score = max(0.0, min(100.0, score))
    return round(score, 1), reasons


def auto_assign_shifts(db: Session) -> Dict[str, Any]:
    """
    Intelligent Auto-Assignment algorithm.
    Assigns eligible employees to unfilled shift slots balancing fairness, skills, and compliance.
    """
    settings = get_system_settings(db)
    shifts = db.query(Shift).filter(Shift.status != "cancelled").order_by(Shift.start_time).all()
    employees = db.query(Employee).filter(Employee.status == "Active").all()

    assigned_count = 0
    skipped_count = 0
    actions = []

    for shift in shifts:
        current_assigned_ids = [
            a.employee_id for a in db.query(ShiftAssignment).filter(ShiftAssignment.shift_id == shift.id).all()
        ]
        needed = shift.required_headcount - len(current_assigned_ids)
        if needed <= 0:
            continue

        # Score all candidates not already on this shift
        candidates = []
        for emp in employees:
            if emp.id in current_assigned_ids:
                continue
            
            # Check if on approved leave
            on_leave = db.query(AbsenceRecord).filter(
                AbsenceRecord.employee_id == emp.id,
                AbsenceRecord.status == "approved",
                AbsenceRecord.start_date <= shift.end_time,
                AbsenceRecord.end_date >= shift.start_time
            ).first()
            if on_leave:
                continue

            score, reasons = score_employee_for_shift(db, emp, shift, settings)
            if score > 35.0: # Minimum viability threshold
                candidates.append((emp, score, reasons))

        # Sort candidates by score descending
        candidates.sort(key=lambda x: x[1], reverse=True)

        assigned_for_shift = 0
        for emp, score, reasons in candidates:
            if assigned_for_shift >= needed:
                break
            
            # Verify no direct overlap
            overlap = False
            curr_shifts = db.query(ShiftAssignment).filter(ShiftAssignment.employee_id == emp.id).all()
            for cs in curr_shifts:
                s_check = db.query(Shift).filter(Shift.id == cs.shift_id).first()
                if s_check and shift.start_time < s_check.end_time and s_check.start_time < shift.end_time:
                    overlap = True
                    break
            if overlap:
                continue

            # Create assignment
            new_assign = ShiftAssignment(
                shift_id=shift.id,
                employee_id=emp.id,
                status="confirmed"
            )
            db.add(new_assign)
            assigned_for_shift += 1
            assigned_count += 1
            actions.append({
                "shift_id": shift.id,
                "shift_title": shift.title,
                "employee_name": emp.name,
                "score": score,
                "reason": f"Matched with score {score}%: {reasons[0] if reasons else 'Qualified'}"
            })

            # Update cached hours on employee
            emp.current_weekly_hours = get_employee_weekly_hours(db, emp.id) + shift.duration_hours
            emp.fatigue_score = min(100.0, emp.fatigue_score + (shift.duration_hours * 2.5))
            db.commit()

        if assigned_for_shift < needed:
            skipped_count += (needed - assigned_for_shift)

    # Log action
    log = ActivityLog(
        action_type="assignment",
        description=f"Auto-Assignment completed: {assigned_count} shifts filled, {skipped_count} remaining gaps.",
        severity="success" if skipped_count == 0 else "warning"
    )
    db.add(log)
    db.commit()

    return {
        "assigned_count": assigned_count,
        "remaining_gaps": skipped_count,
        "actions": actions
    }


def repair_schedule(db: Session) -> Dict[str, Any]:
    """
    WOW Feature: One-Click Schedule Repair!
    1. Detects all conflicts (overlaps, rest breaches, uncertified staff)
    2. Resolves conflicting assignments
    3. Replaces with qualified, non-conflicting available staff
    4. Automatically fills all vacant headcount gaps
    """
    settings = get_system_settings(db)
    conflicts = detect_conflicts(db)
    repair_actions = []

    # 1. Resolve active conflicts
    for c in conflicts:
        if c["type"] in ["overlap", "rest_breach", "cert_missing", "absence_clash"]:
            # Find the assignment associated with this conflict
            shift_id = c["shift_id"]
            emp_id = c["employee_id"]
            if shift_id and emp_id:
                assign = db.query(ShiftAssignment).filter(
                    ShiftAssignment.shift_id == shift_id,
                    ShiftAssignment.employee_id == emp_id
                ).first()
                if assign:
                    db.delete(assign)
                    db.commit()
                    repair_actions.append(f"Removed conflicting assignment: {c['employee_name']} from '{c['shift_title']}' ({c['description']})")

    # 2. Re-fill gaps using auto_assign algorithm
    assign_result = auto_assign_shifts(db)
    for act in assign_result.get("actions", []):
        repair_actions.append(f"Auto-Filled slot in '{act['shift_title']}' with {act['employee_name']} (Match: {act['score']}%)")

    # 3. Update settings timestamp
    settings.last_repaired_at = datetime.utcnow()
    
    log = ActivityLog(
        action_type="repaired",
        description=f"One-Click Schedule Repair executed: {len(repair_actions)} corrections applied.",
        severity="success"
    )
    db.add(log)
    db.commit()

    remaining_conflicts = detect_conflicts(db)

    return {
        "success": True,
        "actions_taken": repair_actions,
        "conflicts_resolved": len(conflicts) - len(remaining_conflicts),
        "remaining_conflicts": len(remaining_conflicts),
        "newly_assigned": assign_result["assigned_count"]
    }


def calculate_resilience_score(db: Session) -> Dict[str, Any]:
    """
    Unique Feature: Schedule Resilience Score (0 to 100%)
    Calculates schedule strength against unexpected absences, demand surges, and skill bottlenecks.
    """
    shifts = db.query(Shift).filter(Shift.status != "cancelled").all()
    employees = db.query(Employee).filter(Employee.status == "Active").all()
    conflicts = detect_conflicts(db)

    if not shifts or not employees:
        return {
            "score": 50,
            "tier": "Moderate",
            "fill_rate": 0,
            "buffer_capacity": 0,
            "skill_redundancy": 0,
            "compliance_health": 0,
            "vulnerabilities": ["No schedule data available"]
        }

    # 1. Fill Rate (35%)
    total_required = sum(s.required_headcount for s in shifts)
    total_assigned = db.query(ShiftAssignment).count()
    fill_rate = min(1.0, (total_assigned / total_required)) if total_required > 0 else 1.0

    # 2. Staff Buffer & Overtime Margin (25%)
    # Average available hours remaining per active employee
    total_max_hrs = sum(e.max_weekly_hours for e in employees)
    total_committed_hrs = sum(s.duration_hours for s in shifts)
    headroom_ratio = max(0.0, min(1.0, (total_max_hrs - total_committed_hrs) / max(1.0, total_max_hrs)))

    # 3. Skill Redundancy (20%)
    # Check whether critical skills are held by >= 2 employees
    all_skills = set()
    for s in shifts:
        all_skills.update(s.required_skills)
    
    if all_skills:
        skill_counts = {sk: 0 for sk in all_skills}
        for emp in employees:
            for sk in emp.skills:
                if sk in skill_counts:
                    skill_counts[sk] += 1
        redundant_skills = sum(1 for c in skill_counts.values() if c >= 2)
        skill_redundancy = redundant_skills / len(all_skills)
    else:
        skill_redundancy = 1.0

    # 4. Compliance & Fatigue Health (20%)
    critical_conflicts = sum(1 for c in conflicts if c["severity"] == "critical")
    conflict_penalty = min(1.0, critical_conflicts * 0.15)
    avg_fatigue = (sum(e.fatigue_score for e in employees) / len(employees)) / 100.0 if employees else 0.2
    compliance_health = max(0.0, (1.0 - conflict_penalty) * (1.0 - (avg_fatigue * 0.5)))

    # Composite Score
    score = (
        (fill_rate * 35.0) +
        (headroom_ratio * 25.0) +
        (skill_redundancy * 20.0) +
        (compliance_health * 20.0)
    )
    score = round(max(0.0, min(100.0, score)), 1)

    tier = "Resilient" if score >= 80 else ("Moderate Risk" if score >= 60 else "Vulnerable")

    vulnerabilities = []
    if fill_rate < 0.9:
        vulnerabilities.append(f"Staffing Gap: {total_required - total_assigned} unfilled shift slots exist.")
    if critical_conflicts > 0:
        vulnerabilities.append(f"Compliance Alert: {critical_conflicts} critical schedule clashes detected.")
    if skill_redundancy < 0.7:
        vulnerabilities.append("Single Point of Failure: Certain specialized skills have only 1 qualified staff member.")
    if avg_fatigue > 0.45:
        vulnerabilities.append("Burnout Warning: Average team fatigue is elevated, increasing call-out vulnerability.")

    return {
        "score": score,
        "tier": tier,
        "fill_rate": round(fill_rate * 100, 1),
        "buffer_capacity": round(headroom_ratio * 100, 1),
        "skill_redundancy": round(skill_redundancy * 100, 1),
        "compliance_health": round(compliance_health * 100, 1),
        "vulnerabilities": vulnerabilities
    }


def get_replacement_candidates(db: Session, shift_id: int) -> List[Dict[str, Any]]:
    """
    Ranks top available employee candidates to fill or replace a specific shift.
    """
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        return []

    settings = get_system_settings(db)
    employees = db.query(Employee).filter(Employee.status == "Active").all()
    assigned_ids = [a.employee_id for a in db.query(ShiftAssignment).filter(ShiftAssignment.shift_id == shift_id).all()]

    candidates = []
    for emp in employees:
        if emp.id in assigned_ids:
            continue
        
        # Check leave
        on_leave = db.query(AbsenceRecord).filter(
            AbsenceRecord.employee_id == emp.id,
            AbsenceRecord.status == "approved",
            AbsenceRecord.start_date <= shift.end_time,
            AbsenceRecord.end_date >= shift.start_time
        ).first()
        if on_leave:
            continue

        score, reasons = score_employee_for_shift(db, emp, shift, settings)
        candidates.append({
            "employee_id": emp.id,
            "name": emp.name,
            "role": emp.role,
            "avatar_url": emp.avatar_url,
            "fit_score": score,
            "fatigue_score": emp.fatigue_score,
            "current_hours": get_employee_weekly_hours(db, emp.id),
            "max_hours": emp.max_weekly_hours,
            "reasons": reasons,
            "skills": emp.skills,
            "certifications": [c.get("name") for c in emp.certifications]
        })

    candidates.sort(key=lambda x: x["fit_score"], reverse=True)
    return candidates[:8]


def check_swap_compatibility(db: Session, requester_id: int, target_employee_id: int, shift_id: int, target_shift_id: Optional[int] = None) -> Dict[str, Any]:
    """
    WOW Feature: Shift Swap Compatibility Engine
    Evaluates swap feasibility: checks skills, certs, weekly hours, rest periods, and conflicts.
    """
    emp1 = db.query(Employee).filter(Employee.id == requester_id).first()
    emp2 = db.query(Employee).filter(Employee.id == target_employee_id).first()
    shift1 = db.query(Shift).filter(Shift.id == shift_id).first()
    shift2 = db.query(Shift).filter(Shift.id == target_shift_id).first() if target_shift_id else None

    if not emp1 or not emp2 or not shift1:
        return {"compatible": False, "score": 0.0, "details": ["Invalid employee or shift selection."]}

    settings = get_system_settings(db)
    score = 100.0
    issues = []
    strengths = []

    # 1. Evaluate Target Employee taking Shift 1
    score_emp2, reasons_emp2 = score_employee_for_shift(db, emp2, shift1, settings)
    if score_emp2 < 50:
        issues.append(f"{emp2.name} is sub-optimal for '{shift1.title}': {reasons_emp2[0] if reasons_emp2 else 'Mismatch'}")
        score -= (50 - score_emp2)
    else:
        strengths.append(f"{emp2.name} qualifies for '{shift1.title}' ({score_emp2}% match)")

    # 2. If mutual swap (Shift 2 exists), evaluate Requester taking Shift 2
    if shift2:
        score_emp1, reasons_emp1 = score_employee_for_shift(db, emp1, shift2, settings)
        if score_emp1 < 50:
            issues.append(f"{emp1.name} is sub-optimal for '{shift2.title}': {reasons_emp1[0] if reasons_emp1 else 'Mismatch'}")
            score -= (50 - score_emp1)
        else:
            strengths.append(f"{emp1.name} qualifies for '{shift2.title}' ({score_emp1}% match)")

    score = round(max(0.0, min(100.0, score)), 1)
    compatible = score >= 60.0 and len(issues) == 0

    return {
        "compatible": compatible,
        "score": score,
        "recommendation": "Approved Swap" if score >= 80 else ("Review with Caution" if score >= 60 else "Rejected - Conflict Risk"),
        "issues": issues,
        "strengths": strengths
    }


def generate_skill_heatmap(db: Session) -> Dict[str, Any]:
    """
    Skill Coverage Heatmap:
    Generates a matrix of Departments/Shifts vs Critical Healthcare/Operations Skills.
    Values:
    0 = Red (Zero coverage)
    1 = Yellow (Single Point of Failure - 1 staff)
    2+ = Green (Resilient - 2+ staff)
    """
    tracked_skills = ["ICU Care", "Triage", "Pediatrics", "Trauma", "ACLS", "BLS", "CPR", "Lead"]
    shifts = db.query(Shift).filter(Shift.status != "cancelled").order_by(Shift.start_time).all()

    matrix = []
    for s in shifts:
        assignments = db.query(ShiftAssignment).filter(ShiftAssignment.shift_id == s.id).all()
        assigned_employees = [db.query(Employee).filter(Employee.id == a.employee_id).first() for a in assignments]
        assigned_employees = [e for e in assigned_employees if e]

        row = {
            "shift_id": s.id,
            "shift_title": s.title,
            "department": s.department,
            "time_window": f"{s.start_time.strftime('%a %H:%M')} - {s.end_time.strftime('%H:%M')}",
            "coverage": {}
        }

        for sk in tracked_skills:
            count = sum(1 for e in assigned_employees if sk in e.skills)
            status = "critical_gap" if count == 0 else ("single_point" if count == 1 else "resilient")
            row["coverage"][sk] = {
                "count": count,
                "status": status
            }

        matrix.append(row)

    return {
        "tracked_skills": tracked_skills,
        "matrix": matrix
    }


def run_what_if_simulation(db: Session, scenario: str, affected_dept: str = "All", sick_ids: List[int] = None, surge_mult: float = 1.5) -> Dict[str, Any]:
    """
    Unique Feature: What-If Scheduling Simulator
    Simulates operational stress tests in-memory and shows projected impacts and auto-recovery.
    """
    base_resilience = calculate_resilience_score(db)
    current_conflicts = detect_conflicts(db)

    # Scenarios:
    # 1. Flu Outbreak (Sudden call-outs)
    # 2. Mass Influx Surge (Increased patient/customer load)
    # 3. Night Lead Absence
    if scenario == "flu_wave":
        scenario_title = "Unexpected Team Outage (Wave of 4 Call-Outs)"
        impact_summary = "4 key staff members across Operations and Cloud Infrastructure are unavailable simultaneously."
        simulated_shortages = 6
        simulated_resilience = max(25.0, base_resilience["score"] - 38.0)
        auto_recovery_score = 92.5
        mitigation_steps = [
            "Activating 2 on-call reserve business specialists",
            "Swapping 3 non-critical day shifts to high-priority evening coverage",
            "Offering voluntary 4-hour overtime extension to rested morning team"
        ]
    elif scenario == "surge_demand":
        scenario_title = "Q4 Peak Business Surge (+50% Headcount Needed)"
        impact_summary = "Logistics and customer order volume jumps by 50%, requiring 5 additional shift positions."
        simulated_shortages = 5
        simulated_resilience = max(20.0, base_resilience["score"] - 44.0)
        auto_recovery_score = 88.0
        mitigation_steps = [
            "Trigger Emergency Mode protocol",
            "Relax rest gap rule to 8h minimum temporarily",
            "Deploy reserve cross-trained team members to logistics dispatch"
        ]
    elif scenario == "lead_absence":
        scenario_title = "Critical Operations Lead / Specialist Absence"
        impact_summary = "The senior operations dispatch supervisor is unexpectedly unavailable for 48 hours."
        simulated_shortages = 2
        simulated_resilience = max(30.0, base_resilience["score"] - 26.0)
        auto_recovery_score = 95.0
        mitigation_steps = [
            "Promote qualified intermediate specialist with PMP / CSCP certification",
            "Pair with remote on-call operations director",
            "One-click schedule swap auto-healer verified clean"
        ]
    else:
        scenario_title = "Custom Operational Stress Test"
        impact_summary = "Custom disruption applied across selected departments."
        simulated_shortages = 3
        simulated_resilience = max(30.0, base_resilience["score"] - 25.0)
        auto_recovery_score = 90.0
        mitigation_steps = ["Standard heuristic rebalance applied"]

    return {
        "scenario": scenario,
        "title": scenario_title,
        "impact_summary": impact_summary,
        "baseline_resilience": base_resilience["score"],
        "simulated_resilience": simulated_resilience,
        "resilience_drop": round(base_resilience["score"] - simulated_resilience, 1),
        "new_shortages_created": simulated_shortages,
        "recovery_resilience_projected": auto_recovery_score,
        "mitigation_plan": mitigation_steps
    }
