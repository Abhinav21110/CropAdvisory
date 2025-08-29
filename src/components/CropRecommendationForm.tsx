import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sprout, Droplets, Thermometer, Gauge, FlaskConical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CropRecommendation {
  crop: string;
  confidence: number;
  season: string;
  duration: string;
  water_requirement: string;
  soil_type: string;
}

interface PredictionResult {
  success: boolean;
  primary_recommendation: string;
  confidence: number;
  all_recommendations: CropRecommendation[];
  input_conditions: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  };
}

export default function CropRecommendationForm() {
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      // Validate all fields are filled
      const requiredFields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          throw new Error(`Please fill in ${field}`);
        }
      }

      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          N: parseFloat(formData.N),
          P: parseFloat(formData.P),
          K: parseFloat(formData.K),
          temperature: parseFloat(formData.temperature),
          humidity: parseFloat(formData.humidity),
          ph: parseFloat(formData.ph),
          rainfall: parseFloat(formData.rainfall)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get crop recommendation');
      }

      const result: PredictionResult = await response.json();
      setPrediction(result);
      
      toast({
        title: "Recommendation Generated!",
        description: `Best crop for your conditions: ${result.primary_recommendation}`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get recommendation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span>AI Crop Recommendation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Soil Nutrients */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="N" className="flex items-center space-x-2">
                  <FlaskConical className="h-4 w-4 text-blue-500" />
                  <span>Nitrogen (N) mg/kg</span>
                </Label>
                <Input
                  id="N"
                  type="number"
                  placeholder="0-140"
                  value={formData.N}
                  onChange={(e) => handleInputChange('N', e.target.value)}
                  min="0"
                  max="140"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="P" className="flex items-center space-x-2">
                  <FlaskConical className="h-4 w-4 text-orange-500" />
                  <span>Phosphorus (P) mg/kg</span>
                </Label>
                <Input
                  id="P"
                  type="number"
                  placeholder="5-145"
                  value={formData.P}
                  onChange={(e) => handleInputChange('P', e.target.value)}
                  min="5"
                  max="145"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="K" className="flex items-center space-x-2">
                  <FlaskConical className="h-4 w-4 text-purple-500" />
                  <span>Potassium (K) mg/kg</span>
                </Label>
                <Input
                  id="K"
                  type="number"
                  placeholder="5-205"
                  value={formData.K}
                  onChange={(e) => handleInputChange('K', e.target.value)}
                  min="5"
                  max="205"
                />
              </div>
            </div>

            {/* Environmental Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature" className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <span>Temperature (°C)</span>
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  placeholder="8-45"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                  min="8"
                  max="45"
                  step="0.1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="humidity" className="flex items-center space-x-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span>Humidity (%)</span>
                </Label>
                <Input
                  id="humidity"
                  type="number"
                  placeholder="14-100"
                  value={formData.humidity}
                  onChange={(e) => handleInputChange('humidity', e.target.value)}
                  min="14"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ph" className="flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-green-500" />
                  <span>Soil pH</span>
                </Label>
                <Input
                  id="ph"
                  type="number"
                  placeholder="3.5-10"
                  value={formData.ph}
                  onChange={(e) => handleInputChange('ph', e.target.value)}
                  min="3.5"
                  max="10"
                  step="0.1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rainfall" className="flex items-center space-x-2">
                  <Droplets className="h-4 w-4 text-cyan-500" />
                  <span>Rainfall (mm)</span>
                </Label>
                <Input
                  id="rainfall"
                  type="number"
                  placeholder="20-300"
                  value={formData.rainfall}
                  onChange={(e) => handleInputChange('rainfall', e.target.value)}
                  min="20"
                  max="300"
                  step="0.1"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full gradient-primary text-white border-0 h-12"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Get Crop Recommendation"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {prediction && (
        <Card className="card-hover gradient-primary text-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI Recommendation Results</span>
              <Badge className="bg-white/20 text-white border-white/30">
                {Math.round(prediction.confidence * 100)}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-heading mb-2">
                {prediction.primary_recommendation.toUpperCase()}
              </h2>
              <p className="text-lg opacity-90">
                Best crop for your conditions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {prediction.all_recommendations.slice(0, 3).map((rec, index) => (
                <Card key={index} className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{rec.crop}</h3>
                      <div className={`w-3 h-3 rounded-full ${getConfidenceColor(rec.confidence)}`} />
                    </div>
                    <div className="space-y-1 text-sm text-white/80">
                      <p><strong>Season:</strong> {rec.season}</p>
                      <p><strong>Duration:</strong> {rec.duration}</p>
                      <p><strong>Water:</strong> {rec.water_requirement}</p>
                      <p><strong>Confidence:</strong> {Math.round(rec.confidence * 100)}%</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
