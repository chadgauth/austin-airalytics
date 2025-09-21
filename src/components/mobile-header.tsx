"use client";

import { BarChart3, HelpCircle, Info, List, MapIcon, Star } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/contexts/dashboard-context";

export function MobileHeader() {
  const { mobileView, setMobileView, helpOpen, setHelpOpen } = useDashboard();

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-neutral-200/50 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gradient-primary">
                Rental Analytics Pro
              </h1>
              <p className="text-xs text-muted-foreground">
                Austin, TX Market Data
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHelpOpen(!helpOpen)}
            className="w-8 h-8 p-0 rounded-full hover:bg-primary-50"
          >
            <HelpCircle className="w-4 h-4 text-primary-600" />
          </Button>
        </div>

        {/* Expandable Help Section */}
        {helpOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-primary-50/50 rounded-lg border border-primary-200/50"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-primary-800">
                <p className="font-medium mb-2">About This Dashboard</p>
                <p className="mb-2">
                  Explore Austin's Airbnb market with real-time data processing
                  and interactive visualizations. This technical showcase
                  demonstrates modern web development with TypeScript, React 19,
                  and advanced data handling.
                </p>
                <div className="space-y-1 text-xs">
                  <p>
                    <strong>Map View:</strong> Interactive geospatial analysis
                    with clustering
                  </p>
                  <p>
                    <strong>List View:</strong> Advanced filtering and data
                    table with sorting
                  </p>
                  <p>
                    <strong>Filters:</strong> Real-time data filtering with
                    instant results
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={mobileView === "map" ? "gradient" : "outline"}
              size="sm"
              onClick={() => setMobileView("map")}
              className="shadow-sm"
            >
              <MapIcon className="w-4 h-4 mr-1" />
              Map
            </Button>
            <Button
              variant={mobileView === "list" ? "gradient" : "outline"}
              size="sm"
              onClick={() => setMobileView("list")}
              className="shadow-sm"
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
            <Button variant="outline" size="sm" asChild className="shadow-sm">
              <Link href="/featured">
                <Star className="w-4 h-4 mr-1" />
                Featured
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
