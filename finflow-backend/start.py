#!/usr/bin/env python3
"""
FinFlow Backend Startup Script
Usage: python start.py
"""
import subprocess
import sys
import os

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print("🚀 Starting FinFlow AI Backend on http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("Press Ctrl+C to stop\n")
    subprocess.run([
        sys.executable, "-m", "uvicorn",
        "main:app",
        "--reload",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--log-level", "info"
    ])
