"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ErrorBar,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsData {
  summary: {
    total_listings: number;
    cleaned_listings: number;
    avg_price: number;
    median_price: number;
    model_coefficients: number[];
    model_intercept: number;
  };
  neighbourhood_analysis: Array<{
    neighbourhood: number;
    avg_price: number;
    count: number;
    min_price: number;
    max_price: number;
  }>;
  room_type_analysis: Array<{
    room_type: string;
    avg_price: number;
    count: number;
  }>;
  top_revenue_listings: Array<{
    id: number;
    occupancy_rate: number;
    avg_price: number;
    annual_revenue: number;
  }>;
  sample_listings: Array<{
    id: number;
    name: string;
    neighbourhood: number;
    price: number;
    accommodates: number;
    room_type: string;
  }>;
  amenity_impact: Array<{
    amenity: string;
    uplift_pct: number;
    ci_lower: number;
    ci_upper: number;
    count_with: number;
    count_without: number;
    avg_price_with: number;
    avg_price_without: number;
  }>;
  hedonic_coefficients: Record<
    string,
    {
      coefficient: number;
      uplift_pct: number;
      p_value: number;
      significant: number;
    }
  >;
  feature_importance: Array<{
    feature: string;
    importance: number;
    shap_mean_abs: number;
  }>;
  amenity_shap: Record<
    string,
    {
      shap_value: number;
      feature_importance: number;
    }
  >;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNeighbourhood1, setSelectedNeighbourhood1] = useState<string>("");
  const [selectedNeighbourhood2, setSelectedNeighbourhood2] = useState<string>("");
  const [selectedAmenity1, setSelectedAmenity1] = useState<string>("");
  const [selectedAmenity2, setSelectedAmenity2] = useState<string>("");
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
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading analytics...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-8">No data available</div>;

  const neighbourhoodData = data.neighbourhood_analysis
    .sort((a, b) => b.avg_price - a.avg_price)
    .slice(0, 20);

  const roomTypeData = data.room_type_analysis;

  const amenityImpactData = data.amenity_impact.map(item => ({
    ...item,
    error: [item.ci_lower, item.ci_upper]
  }));

  const featureImportanceData = data.feature_importance
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10);

  // Comparison data
  const neighbourhoodComparison = selectedNeighbourhood1 && selectedNeighbourhood2
    ? data.neighbourhood_analysis.filter(n =>
        n.neighbourhood.toString() === selectedNeighbourhood1 ||
        n.neighbourhood.toString() === selectedNeighbourhood2
      )
    : [];

  const amenityComparison = selectedAmenity1 && selectedAmenity2
    ? data.amenity_impact.filter(a =>
        a.amenity === selectedAmenity1 || a.amenity === selectedAmenity2
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Airbnb Analytics Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {data.summary.total_listings.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${data.summary.avg_price.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Median Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ${data.summary.median_price}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Base Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${data.summary.model_intercept.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Model baseline when all features are minimal
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Comparisons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Neighbourhood Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Compare Neighbourhood Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <select
                  value={selectedNeighbourhood1}
                  onChange={(e) => setSelectedNeighbourhood1(e.target.value)}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Select Neighbourhood 1</option>
                  {data.neighbourhood_analysis.map(n => (
                    <option key={n.neighbourhood} value={n.neighbourhood.toString()}>
                      {n.neighbourhood} (${n.avg_price.toFixed(2)})
                    </option>
                  ))}
                </select>
                <select
                  value={selectedNeighbourhood2}
                  onChange={(e) => setSelectedNeighbourhood2(e.target.value)}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Select Neighbourhood 2</option>
                  {data.neighbourhood_analysis.map(n => (
                    <option key={n.neighbourhood} value={n.neighbourhood.toString()}>
                      {n.neighbourhood} (${n.avg_price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              {neighbourhoodComparison.length === 2 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={neighbourhoodComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="neighbourhood" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Avg Price"]} />
                    <Bar dataKey="avg_price" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Amenity Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Compare Amenity Impacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <select
                  value={selectedAmenity1}
                  onChange={(e) => setSelectedAmenity1(e.target.value)}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Select Amenity 1</option>
                  {data.amenity_impact.map(a => (
                    <option key={a.amenity} value={a.amenity}>
                      {a.amenity} ({a.uplift_pct.toFixed(2)}%)
                    </option>
                  ))}
                </select>
                <select
                  value={selectedAmenity2}
                  onChange={(e) => setSelectedAmenity2(e.target.value)}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Select Amenity 2</option>
                  {data.amenity_impact.map(a => (
                    <option key={a.amenity} value={a.amenity}>
                      {a.amenity} ({a.uplift_pct.toFixed(2)}%)
                    </option>
                  ))}
                </select>
              </div>
              {amenityComparison.length === 2 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={amenityComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="amenity" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, "Uplift"]} />
                    <Bar dataKey="uplift_pct" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Neighbourhood Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Top 20 Neighbourhoods by Average Price</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={neighbourhoodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="neighbourhood"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toFixed(2)}`,
                      "Avg Price",
                    ]}
                  />
                  <Bar dataKey="avg_price" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Room Type Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Room Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={roomTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ room_type, count }) => `${room_type}: ${count}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {roomTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.room_type}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Amenity Impact with Error Bars */}
          <Card>
            <CardHeader>
              <CardTitle>Amenity Price Impacts (with Confidence Intervals)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={amenityImpactData.slice(0, 8)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="amenity" type="category" width={120} />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'uplift_pct') return [`${value.toFixed(2)}%`, "Uplift"];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="uplift_pct" fill="#82ca9d" />
                  <ErrorBar dataKey="error" width={4} strokeWidth={2} stroke="#666" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Feature Importance */}
          <Card>
            <CardHeader>
              <CardTitle>Top Feature Importance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={featureImportanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="feature"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="importance" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
