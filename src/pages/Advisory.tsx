import { useState } from "react";
import { Wheat, MapPin, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cropAdvisoryData } from "@/data/sampleData";

export default function Advisory() {
  const [selectedLocation, setSelectedLocation] = useState("Punjab, India");
  
  const currentAdvisory = cropAdvisoryData.find(
    advisory => advisory.location === selectedLocation
  ) || cropAdvisoryData[0];

  const locations = [...new Set(cropAdvisoryData.map(item => item.location))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-heading text-foreground">
          Crop Advisory
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get personalized crop recommendations based on your location, soil conditions, 
          and current weather patterns.
        </p>
      </div>

      {/* Location Selector */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Select Your Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Choose location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Main Advisory Card */}
      <Card className="card-hover gradient-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 pulse-slow" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wheat className="h-6 w-6" />
              <span>Recommended Crop</span>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              Current Season
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-4xl font-bold font-heading mb-2">
                {currentAdvisory.recommendedCrop}
              </h2>
              <p className="text-lg opacity-90">
                Best choice for {selectedLocation}
              </p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Why This Crop?</span>
              </h3>
              <p className="text-sm opacity-90">
                {currentAdvisory.reasoning}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Recommendations */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-accent" />
            <span>Regional Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cropAdvisoryData.map((advisory) => (
              <Card 
                key={advisory.id} 
                className={`transition-smooth hover:shadow-md ${
                  advisory.location === selectedLocation 
                    ? "ring-2 ring-primary bg-primary/5" 
                    : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{advisory.location}</CardTitle>
                    <Badge className="gradient-fresh text-white border-0">
                      {advisory.recommendedCrop}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {advisory.reasoning}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full"
                    onClick={() => setSelectedLocation(advisory.location)}
                  >
                    Select This Location
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="gradient-primary text-white border-0 h-16 transition-bouncy hover:scale-105">
          <div className="text-center">
            <div className="font-semibold">Get Detailed Plan</div>
            <div className="text-xs opacity-90">Cultivation timeline</div>
          </div>
        </Button>
        <Button variant="outline" className="h-16 transition-bouncy hover:scale-105">
          <div className="text-center">
            <div className="font-semibold">Soil Requirements</div>
            <div className="text-xs text-muted-foreground">Check compatibility</div>
          </div>
        </Button>
        <Button variant="outline" className="h-16 transition-bouncy hover:scale-105">
          <div className="text-center">
            <div className="font-semibold">Market Analysis</div>
            <div className="text-xs text-muted-foreground">Price trends</div>
          </div>
        </Button>
      </div>
    </div>
  );
}