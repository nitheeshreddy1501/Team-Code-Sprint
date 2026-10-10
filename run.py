"""
ShiftWise Server Runner
Team CODESPRINT • CBC052 • Problem Statement 36
"""
import sys
import os

# Set UTF-8 encoding for standard outputs if available
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

import uvicorn

if __name__ == "__main__":
    print("=" * 65)
    print("  [*] ShiftWise - Business-Based Shift Management System")
    print("  Problem Statement 36 | Team CODESPRINT (CBC052)")
    print("=" * 65)
    print("  Serving Web App at:       http://localhost:8000")
    print("  Interactive Swagger Docs: http://localhost:8000/docs")
    print("=" * 65)
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)
