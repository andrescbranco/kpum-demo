#!/bin/bash

echo "Starting backend on port 8000..."
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000 --log-level info 