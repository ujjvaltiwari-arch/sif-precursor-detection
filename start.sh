#!/usr/bin/env bash
set -euo pipefail

# SIF Precursor Detection System - Linux/macOS Launcher
# Smart India Hackathon 2026 - Problem Statement 26165

echo ""
echo "============================================"
echo " SIF Precursor Detection System"
echo " Oil India Limited - SIH 2026"
echo "============================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

cleanup() {
    echo ""
    echo "Shutting down servers..."
    [ -n "${BACKEND_PID:-}" ] && kill "$BACKEND_PID" 2>/dev/null || true
    [ -n "${FRONTEND_PID:-}" ] && kill "$FRONTEND_PID" 2>/dev/null || true
    echo "Servers stopped."
}
trap cleanup EXIT INT TERM

# Setup backend venv if missing
if [ ! -d "$VENV_DIR" ]; then
    echo "[SETUP] Creating Python virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Install backend deps
echo "[SETUP] Installing backend dependencies..."
source "$VENV_DIR/bin/activate"
pip install -r "$BACKEND_DIR/requirements.txt" --quiet

# Install frontend deps if needed
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "[SETUP] Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm install --silent
fi

echo ""
echo "[START] Launching backend server on http://localhost:8000..."
cd "$BACKEND_DIR"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

sleep 3

echo "[START] Launching frontend server on http://localhost:5173..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo " Both servers started!"
echo " Backend:  http://localhost:8000"
echo " Frontend: http://localhost:5173"
echo " API Docs: http://localhost:8000/docs"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop all servers."

wait
