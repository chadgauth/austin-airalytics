"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsData {
  neighbourhood_analysis: Array<{
    neighbourhood: number;
    avg_price: number;
    count: number;
  }>;
  room_type_analysis: Array<{
    room_type: string;
    avg_price: number;
    count: number;
  }>;
  hedonic_coefficients: Record<string, any>;
  summary: {
    avg_price: number;
  };
}

export default function PricePredictor() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<any>(null);
  const [predictorInputs, setPredictorInputs] = useState({
    neighbourhood: "",
    room_type: "",
    accommodates: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [] as string[]
  });

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handlePrediction = async () => {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictorInputs)
      });
      const result = await response.json();
      setPrediction(result);
    } catch (error) {
      console.error('Prediction error:', error);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setPredictorInputs(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  if (loading) return <div>Loading predictor...</div>;
  if (!data) return <div>Unable to load data</div>;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Airbnb Price Predictor
        </CardTitle>
        <p className="text-center text-gray-600">
          Get accurate nightly rate predictions for Austin properties
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Austin Zip Code</label>
            <select
              value={predictorInputs.neighbourhood}
              onChange={(e) => setPredictorInputs(prev => ({ ...prev, neighbourhood: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Zip Code</option>
              {data.neighbourhood_analysis.map(n => (
                <option key={n.neighbourhood} value={n.neighbourhood.toString()}>
                  {n.neighbourhood} (avg: ${n.avg_price.toFixed(0)}/night)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Room Type</label>
            <select
              value={predictorInputs.room_type}
              onChange={(e) => setPredictorInputs(prev => ({ ...prev, room_type: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Room Type</option>
              {data.room_type_analysis.map(rt => (
                <option key={rt.room_type} value={rt.room_type}>
                  {rt.room_type}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium mb-2">Guests</label>
              <input
                type="number"
                value={predictorInputs.accommodates}
                onChange={(e) => setPredictorInputs(prev => ({ ...prev, accommodates: parseInt(e.target.value) || 2 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="16"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bedrooms</label>
              <input
                type="number"
                value={predictorInputs.bedrooms}
                onChange={(e) => setPredictorInputs(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 1 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bathrooms</label>
              <input
                type="number"
                value={predictorInputs.bathrooms}
                onChange={(e) => setPredictorInputs(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 1 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="10"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Popular Amenities</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(data.hedonic_coefficients).slice(0, 12).map(amenity => (
              <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={predictorInputs.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{amenity.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={handlePrediction}
            className="px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Predict Nightly Rate
          </Button>
        </div>

        {prediction && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Predicted Nightly Rate</h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">
                ${prediction.predictedPrice.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">
                Based on Austin market data • {(prediction.confidence * 100).toFixed(0)}% confidence
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">${prediction.factors.neighbourhood.toFixed(0)}</div>
                <div className="text-xs text-gray-600">Location Premium</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">${prediction.factors.room_type.toFixed(0)}</div>
                <div className="text-xs text-gray-600">Room Type</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">${(prediction.factors.size * 5).toFixed(0)}</div>
                <div className="text-xs text-gray-600">Size Factor</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{prediction.factors.amenities}</div>
                <div className="text-xs text-gray-600">Amenities</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}