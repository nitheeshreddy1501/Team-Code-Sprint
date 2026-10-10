# ShiftWise — Smart Shift Scheduling with Gap & Conflict Detection

> **Hackathon Submission**: CBC 2.0 Hackathon • Design & Code Round  
> **Problem Statement**: PS-36: Employee Shift Scheduling System  
> **Team Name**: CODESPRINT  
> **Team ID**: CBC052  
> **College**: Sapthagiri NPS University  
> **Domain**: Software & Web Development  

---

## 🎯 Problem Statement Overview
Businesses with shift-based operations (hospitals, emergency centers, retail, logistics) need to schedule employees while considering availability, required staffing levels, skills, and working-hour limits. Manual scheduling in spreadsheets and chats results in:
1. Gaps and overlaps found too late
2. Uncovered shifts hurting patient/customer care
3. Fatigue, burnout, and rest period breaches
4. Managers losing hours on roster rework

**ShiftWise** is an intelligent web application that builds practical employee shift schedules by auto-suggesting assignments from availability, skills, and working hour limits while identifying staffing gaps and compliance conflicts before publishing.

---

## 🚀 Key Features

### 1. Core Scheduling & Management Features
- **Live Scheduling Dashboard**: Executive overview with real-time KPI metrics, coverage rate, staffing shortage counter, and activity audit feed.
- **Employee Management**: Profiles with roles, hourly rates, skills inventory, active certifications, availability matrix, weekly hour limits, and fatigue tracking.
- **Shift Management**: Department-level scheduling with start/end windows, required headcount, role requirements, and skill/certification prerequisites.
- **Automatic Employee Assignment**: Multi-factor heuristic solver balancing skills match, certification verification, availability, weekly hour limits, and fair workload distribution.
- **Conflict & Compliance Detection Engine**:
  - Overlapping shift detection (double booking)
  - Mandatory rest period breaches (< 11 hours between consecutive shifts)
  - Maximum weekly work hour limit breaches (> 40h standard or > 56h emergency)
  - Missing or expired mandatory certifications
  - Approved leave and absence clashes
- **Real-Time Staffing Shortage Alerts**: Live visual counter and alert drawer highlighting understaffed shifts with 1-click candidate replacement.
- **Automatic Replacement Recommendation**: Ranks top qualified available employees for any vacant shift with fit scores and explanations.

### 2. Unique Innovations (Slide 7 Differentiation)
- **Schedule Resilience Score (0–100%)**: Composite index calculating schedule strength against unexpected call-outs, staff buffer margins, and single-point-of-failure skill bottlenecks.
- **What-If Scheduling Simulator**: Sandbox to test scenarios like *Flu Outbreak (4 nurse call-outs)*, *Patient Influx Surge (+50% headcount)*, or *Specialist Absence*, demonstrating impact and automated recovery plans.
- **Skill Coverage Heatmap (Competency Matrix)**: Visual matrix mapping shifts against critical competencies (ICU, Triage, Trauma, ACLS, BLS, CPR, Lead) showing coverage depth (0=Critical Gap, 1=Single Point of Failure, 2+=Resilient).

### 3. WOW Features
- **One-Click Schedule Repair**: AI auto-healer that resolves active conflicts, unassigns clashing shifts, replaces them with non-conflicting qualified staff, and fills vacant slots in a single click.
- **Emergency Mode (Disaster Response)**: One-click toggle that expands maximum allowable hours to 56h, lowers rest thresholds, and activates on-call reserve staff.
- **Certification-Based Scheduling**: Validates unexpired credentials (ATLS, ACLS, BLS, PALS, OSHA) required for high-acuity shifts.
- **Shift Swap Compatibility Checker**: Analyzes proposed swaps between two employees for overlaps, rest rule violations, and qualification gaps before managerial approval.
- **Skill Upgrade Academy (Course Platform)**: Employees can take and complete skill modules (e.g., ATLS, PALS, ICU Hemodynamics), instantly unlocking certified skills and qualifying them for higher shifts.
- **Multi-Language Support (i18n)**: Instant switcher for English, Spanish, French, German, Hindi, and Japanese.

---

## 🛠️ Technology Stack
- **Backend**: Python 3.14 + FastAPI + Pydantic
- **Database**: SQLAlchemy 2.0 with SQLite (zero-config, high performance)
- **Frontend**: React 18 + Tailwind CSS + Lucide Icons + Google Fonts (Plus Jakarta Sans & Inter)
- **Architecture**: REST API with real-time rule engine and static single-page app delivery

---

## 💻 Quick Start & Running Locally

### 1. Requirements
- Python 3.10+ (Python 3.14 installed on system)
- Modern web browser (Chrome, Edge, Firefox)

### 2. Start Server
Run the launcher script:
```powershell
py -3 run.py
```
Or directly with Uvicorn:
```powershell
py -3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Access ShiftWise
- **Web Application**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
