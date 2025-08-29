from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os
import requests
from pathlib import Path
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load the trained model
MODEL_PATH = Path(__file__).parent.parent / "Models" / "model_training" / "crop_model.pkl"

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("✅ Crop recommendation model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Feature names expected by the model
FEATURE_NAMES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

# Indian states and major cities for weather data
INDIAN_STATES = {
    'Andhra Pradesh': {'city': 'Hyderabad', 'lat': 17.3850, 'lon': 78.4867},
    'Arunachal Pradesh': {'city': 'Itanagar', 'lat': 27.0844, 'lon': 93.6053},
    'Assam': {'city': 'Guwahati', 'lat': 26.1445, 'lon': 91.7362},
    'Bihar': {'city': 'Patna', 'lat': 25.5941, 'lon': 85.1376},
    'Chhattisgarh': {'city': 'Raipur', 'lat': 21.2514, 'lon': 81.6296},
    'Goa': {'city': 'Panaji', 'lat': 15.4909, 'lon': 73.8278},
    'Gujarat': {'city': 'Ahmedabad', 'lat': 23.0225, 'lon': 72.5714},
    'Haryana': {'city': 'Chandigarh', 'lat': 30.7333, 'lon': 76.7794},
    'Himachal Pradesh': {'city': 'Shimla', 'lat': 31.1048, 'lon': 77.1734},
    'Jharkhand': {'city': 'Ranchi', 'lat': 23.3441, 'lon': 85.3096},
    'Karnataka': {'city': 'Bangalore', 'lat': 12.9716, 'lon': 77.5946},
    'Kerala': {'city': 'Thiruvananthapuram', 'lat': 8.5241, 'lon': 76.9366},
    'Madhya Pradesh': {'city': 'Bhopal', 'lat': 23.2599, 'lon': 77.4126},
    'Maharashtra': {'city': 'Mumbai', 'lat': 19.0760, 'lon': 72.8777},
    'Manipur': {'city': 'Imphal', 'lat': 24.8170, 'lon': 93.9368},
    'Meghalaya': {'city': 'Shillong', 'lat': 25.5788, 'lon': 91.8933},
    'Mizoram': {'city': 'Aizawl', 'lat': 23.7271, 'lon': 92.7176},
    'Nagaland': {'city': 'Kohima', 'lat': 25.6751, 'lon': 94.1086},
    'Odisha': {'city': 'Bhubaneswar', 'lat': 20.2961, 'lon': 85.8245},
    'Punjab': {'city': 'Chandigarh', 'lat': 30.7333, 'lon': 76.7794},
    'Rajasthan': {'city': 'Jaipur', 'lat': 26.9124, 'lon': 75.7873},
    'Sikkim': {'city': 'Gangtok', 'lat': 27.3389, 'lon': 88.6065},
    'Tamil Nadu': {'city': 'Chennai', 'lat': 13.0827, 'lon': 80.2707},
    'Telangana': {'city': 'Hyderabad', 'lat': 17.3850, 'lon': 78.4867},
    'Tripura': {'city': 'Agartala', 'lat': 23.8315, 'lon': 91.2868},
    'Uttar Pradesh': {'city': 'Lucknow', 'lat': 26.8467, 'lon': 80.9462},
    'Uttarakhand': {'city': 'Dehradun', 'lat': 30.3165, 'lon': 78.0322},
    'West Bengal': {'city': 'Kolkata', 'lat': 22.5726, 'lon': 88.3639}
}

# Weather API configuration (using OpenWeatherMap - free tier)
WEATHER_API_KEY = "your_openweather_api_key"  # Replace with actual API key
WEATHER_API_URL = "http://api.openweathermap.org/data/2.5/weather"

# Crop information for better recommendations
CROP_INFO = {
    'rice': {
        'season': 'Kharif',
        'duration': '120-150 days',
        'water_requirement': 'High',
        'soil_type': 'Clay, loamy'
    },
    'wheat': {
        'season': 'Rabi',
        'duration': '120-150 days', 
        'water_requirement': 'Medium',
        'soil_type': 'Loamy, clay loamy'
    },
    'maize': {
        'season': 'Kharif/Rabi',
        'duration': '80-120 days',
        'water_requirement': 'Medium',
        'soil_type': 'Well-drained loamy'
    },
    'cotton': {
        'season': 'Kharif',
        'duration': '180-200 days',
        'water_requirement': 'Medium-High',
        'soil_type': 'Black cotton soil'
    },
    'sugarcane': {
        'season': 'Year-round',
        'duration': '12-18 months',
        'water_requirement': 'Very High',
        'soil_type': 'Rich loamy'
    },
    'jute': {
        'season': 'Kharif',
        'duration': '120-150 days',
        'water_requirement': 'High',
        'soil_type': 'Alluvial'
    }
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict_crop():
    """Predict the best crop based on soil and weather conditions"""
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
            
        data = request.json
        
        # Validate input data
        required_fields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Prepare input for prediction
        input_data = [[
            float(data['N']),
            float(data['P']),
            float(data['K']),
            float(data['temperature']),
            float(data['humidity']),
            float(data['ph']),
            float(data['rainfall'])
        ]]
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        
        # Get prediction probabilities for confidence score
        probabilities = model.predict_proba(input_data)[0]
        confidence = float(max(probabilities))
        
        # Get top 3 recommendations
        top_indices = np.argsort(probabilities)[-3:][::-1]
        recommendations = []
        
        for idx in top_indices:
            crop_name = model.classes_[idx]
            prob = float(probabilities[idx])
            crop_details = CROP_INFO.get(crop_name.lower(), {})
            
            recommendations.append({
                'crop': crop_name,
                'confidence': prob,
                'season': crop_details.get('season', 'N/A'),
                'duration': crop_details.get('duration', 'N/A'),
                'water_requirement': crop_details.get('water_requirement', 'N/A'),
                'soil_type': crop_details.get('soil_type', 'N/A')
            })
        
        return jsonify({
            'success': True,
            'primary_recommendation': prediction,
            'confidence': confidence,
            'all_recommendations': recommendations,
            'input_conditions': {
                'nitrogen': data['N'],
                'phosphorus': data['P'],
                'potassium': data['K'],
                'temperature': data['temperature'],
                'humidity': data['humidity'],
                'ph': data['ph'],
                'rainfall': data['rainfall']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_weather_data(state_name):
    """Get current weather data for a state"""
    try:
        if state_name not in INDIAN_STATES:
            return None
            
        state_info = INDIAN_STATES[state_name]
        
        # For demo purposes, return mock weather data if API key not configured
        if WEATHER_API_KEY == "your_openweather_api_key":
            # Mock weather data based on typical conditions
            mock_data = {
                'temperature': 25.0 + (state_info['lat'] - 20) * 0.5,  # Rough temp based on latitude
                'humidity': 65.0,
                'rainfall': 150.0  # mm (monthly average)
            }
            return mock_data
            
        # Real API call
        params = {
            'lat': state_info['lat'],
            'lon': state_info['lon'],
            'appid': WEATHER_API_KEY,
            'units': 'metric'
        }
        
        response = requests.get(WEATHER_API_URL, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return {
                'temperature': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'rainfall': data.get('rain', {}).get('1h', 0) * 24 * 30  # Convert to monthly
            }
        return None
    except Exception as e:
        print(f"Weather API error: {e}")
        return None

def estimate_soil_nutrients(state_name):
    """Estimate typical soil nutrients for a state based on agricultural data"""
    # Typical soil nutrient ranges for different regions
    soil_profiles = {
        'Punjab': {'N': 85, 'P': 45, 'K': 50, 'ph': 7.2},
        'Haryana': {'N': 80, 'P': 42, 'K': 48, 'ph': 7.5},
        'Uttar Pradesh': {'N': 75, 'P': 38, 'K': 45, 'ph': 7.0},
        'Bihar': {'N': 70, 'P': 35, 'K': 40, 'ph': 6.8},
        'West Bengal': {'N': 85, 'P': 40, 'K': 55, 'ph': 6.5},
        'Maharashtra': {'N': 65, 'P': 30, 'K': 35, 'ph': 7.8},
        'Karnataka': {'N': 60, 'P': 28, 'K': 32, 'ph': 6.2},
        'Tamil Nadu': {'N': 70, 'P': 32, 'K': 38, 'ph': 6.8},
        'Andhra Pradesh': {'N': 68, 'P': 30, 'K': 36, 'ph': 7.0},
        'Telangana': {'N': 68, 'P': 30, 'K': 36, 'ph': 7.0},
        'Gujarat': {'N': 55, 'P': 25, 'K': 30, 'ph': 8.0},
        'Rajasthan': {'N': 45, 'P': 20, 'K': 25, 'ph': 8.2},
        'Madhya Pradesh': {'N': 60, 'P': 28, 'K': 35, 'ph': 7.2},
        'Odisha': {'N': 75, 'P': 35, 'K': 42, 'ph': 6.5},
        'Kerala': {'N': 80, 'P': 38, 'K': 50, 'ph': 5.8},
        'Assam': {'N': 90, 'P': 45, 'K': 60, 'ph': 5.5}
    }
    
    # Default values for states not in the profile
    default = {'N': 65, 'P': 32, 'K': 40, 'ph': 6.8}
    
    return soil_profiles.get(state_name, default)

@app.route('/states', methods=['GET'])
def get_states():
    """Get list of all Indian states"""
    return jsonify({
        'states': list(INDIAN_STATES.keys()),
        'count': len(INDIAN_STATES)
    })

@app.route('/regional-recommendation/<state_name>', methods=['GET'])
def get_regional_recommendation(state_name):
    """Get crop recommendation for a specific state using weather data and soil estimates"""
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
            
        if state_name not in INDIAN_STATES:
            return jsonify({'error': 'State not found'}), 404
            
        # Get weather data
        weather_data = get_weather_data(state_name)
        if not weather_data:
            return jsonify({'error': 'Weather data unavailable'}), 503
            
        # Get soil estimates
        soil_data = estimate_soil_nutrients(state_name)
        
        # Prepare input for prediction
        input_data = [[
            soil_data['N'],
            soil_data['P'],
            soil_data['K'],
            weather_data['temperature'],
            weather_data['humidity'],
            soil_data['ph'],
            weather_data['rainfall']
        ]]
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]
        confidence = float(max(probabilities))
        
        # Get top 3 recommendations
        top_indices = np.argsort(probabilities)[-3:][::-1]
        recommendations = []
        
        for idx in top_indices:
            crop_name = model.classes_[idx]
            prob = float(probabilities[idx])
            crop_details = CROP_INFO.get(crop_name.lower(), {})
            
            recommendations.append({
                'crop': crop_name,
                'confidence': prob,
                'season': crop_details.get('season', 'N/A'),
                'duration': crop_details.get('duration', 'N/A'),
                'water_requirement': crop_details.get('water_requirement', 'N/A'),
                'soil_type': crop_details.get('soil_type', 'N/A')
            })
        
        return jsonify({
            'success': True,
            'state': state_name,
            'city': INDIAN_STATES[state_name]['city'],
            'primary_recommendation': prediction,
            'confidence': confidence,
            'all_recommendations': recommendations,
            'conditions': {
                'weather': weather_data,
                'soil': soil_data
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/crop-info/<crop_name>', methods=['GET'])
def get_crop_info(crop_name):
    """Get detailed information about a specific crop"""
    crop_details = CROP_INFO.get(crop_name.lower())
    if crop_details:
        return jsonify({
            'crop': crop_name,
            'details': crop_details
        })
    else:
        return jsonify({'error': 'Crop information not found'}), 404

if __name__ == '__main__':
    print("🌾 Starting CropCare Recommendation API...")
    print(f"📍 Model path: {MODEL_PATH}")
    print("🚀 Server running on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
