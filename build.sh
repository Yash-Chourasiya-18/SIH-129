#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- Building Frontend ---"
cd frontend
npm install
npm run build
cd ..

echo "--- Installing Backend Dependencies & Initializing DB ---"
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
python seed_data.py
cd ..

echo "--- Build Completed Successfully ---"
