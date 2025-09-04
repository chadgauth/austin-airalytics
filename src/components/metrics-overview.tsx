"use client";

import {
  DollarSign,
  Home,
  MapPin,
  Play,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    neighbourhood: string;
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
    neighbourhood: string;
    price: number;
    accommodates: number;
    room_type: string;
  }>;
}

export default function MetricsOverview() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningAnalytics, setRunningAnalytics] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const runAnalytics = async () => {
    setRunningAnalytics(true);
    try {
      const response = await fetch('/api/analytics/run', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to run analytics');
      }

      const result = await response.json();

      if (result.success) {
        // Refresh the analytics data
        const analyticsResponse = await fetch('/api/analytics');
        if (analyticsResponse.ok) {
          const newData = await analyticsResponse.json();
          setAnalyticsData(newData);
        }
      } else {
        throw new Error(result.error || 'Analytics run failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run analytics');
    } finally {
      setRunningAnalytics(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>Failed to load analytics data</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </Card>
    );
  }

  const {
    summary,
    neighbourhood_analysis,
    room_type_analysis,
    top_revenue_listings,
  } = analyticsData;

  return (
    <div className="space-y-8">
      {/* Analytics Control */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Analytics</h2>
          <p className="text-muted-foreground">Real-time insights powered by Python analytics</p>
        </div>
        <Button
          onClick={runAnalytics}
          disabled={runningAnalytics}
          className="flex items-center gap-2"
        >
          {runningAnalytics ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {runningAnalytics ? 'Running Analytics...' : 'Run Analytics'}
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Listings
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.total_listings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.cleaned_listings.toLocaleString()} after cleaning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.avg_price.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Median: ${summary.median_price}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Neighbourhood
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {neighbourhood_analysis[0]?.neighbourhood}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: ${neighbourhood_analysis[0]?.avg_price.toFixed(0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue Leader
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(top_revenue_listings[0]?.annual_revenue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">Annual revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Room Type Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Room Type Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {room_type_analysis.map((roomType) => (
              <div key={roomType.room_type} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{roomType.room_type}</span>
                  <Badge variant="secondary">{roomType.count}</Badge>
                </div>
                <div className="text-2xl font-bold text-primary">
                  ${roomType.avg_price.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">Average price</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Neighbourhoods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top Neighbourhoods by Average Price
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {neighbourhood_analysis
              .sort((a, b) => b.avg_price - a.avg_price)
              .slice(0, 10)
              .map((neighbourhood) => (
                <div
                  key={neighbourhood.neighbourhood}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {neighbourhood.neighbourhood}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {neighbourhood.count} listings
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      ${neighbourhood.avg_price.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${neighbourhood.min_price} - ${neighbourhood.max_price}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Revenue Listings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Revenue Listings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {top_revenue_listings.slice(0, 5).map((listing) => (
              <div
                key={listing.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">Listing #{listing.id}</div>
                  <div className="text-sm text-muted-foreground">
                    Occupancy: {(listing.occupancy_rate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    ${(listing.annual_revenue / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${listing.avg_price}/night
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
