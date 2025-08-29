@echo off
echo Installing Python dependencies...
pip install -r requirements.txt

echo Starting CropCare Recommendation API...
python app.py

pause
