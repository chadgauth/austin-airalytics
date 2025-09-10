"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Filter,
  HelpCircle,
  Info,
  List,
  MapIcon,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// import { ProfitCalculator } from "@/components/profit-calculator";

export default function DashboardLayout({
  sidebar,
  map,
  table,
}: {
  sidebar: React.ReactElement;
  map: React.ReactElement;
  table: React.ReactElement;
}) {
  // Mobile-specific state
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="min-h-screen">
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
          </div>
        </div>

        {/* Mobile Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="text-center p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-neutral-200/50">
            <div className="text-lg font-bold text-accent-600 font-mono">
              Live
            </div>
            <div className="text-xs text-muted-foreground">Real-time Data</div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <section className="hidden md:block bg-gradient-to-br from-neutral-50/50 via-background to-neutral-50/30">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6 border border-primary-200">
                <BarChart3 className="w-4 h-4" />
                Technical Portfolio Showcase
              </div>
              <h1 className="text-5xl font-bold mb-6 text-gradient-primary">
                Austin Airbnb Analytics Pro
              </h1>
              <p className="text-muted-foreground text-xl max-w-4xl mx-auto leading-relaxed mb-8">
                A sophisticated data analysis platform built with Next.js,
                Tailwind CSS, and tRPC. Showcasing modern full-stack development
                techniques to process and visualize real estate market data in real-time.
              </p>
            </div>

            {/* Key Stats and Tech Highlights */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-neutral-200/50"
              >
                <div className="text-2xl font-bold text-accent-600 mb-2 font-mono">
                  Next.js
                </div>
                <div className="text-sm text-muted-foreground">Framework</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-neutral-200/50"
              >
                <div className="text-2xl font-bold text-primary-600 mb-2 font-mono">
                  Tailwind CSS
                </div>
                <div className="text-sm text-muted-foreground">Styling</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-neutral-200/50"
              >
                <div className="text-2xl font-bold text-accent-600 mb-2 font-mono">
                  tRPC
                </div>
                <div className="text-sm text-muted-foreground">API Layer</div>
              </motion.div>
            </div>

            {/* Technical Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-center"
            >
              <p className="text-muted-foreground max-w-3xl mx-auto">
                This application showcases modern full-stack development with
                tRPC for type-safe APIs, Tailwind CSS for responsive styling,
                and Next.js for server-side rendering and performance. Features
                real-time data streaming and interactive geospatial visualizations.
              </p>
            </motion.div>
          </motion.div>

          {/* Quick Actions Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold">Market Analysis Tools</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Live Data
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileView("map")}
                className={
                  mobileView === "map" ? "bg-primary-50 border-primary-300" : ""
                }
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Map View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileView("list")}
                className={
                  mobileView === "list"
                    ? "bg-primary-50 border-primary-300"
                    : ""
                }
              >
                <List className="w-4 h-4 mr-2" />
                Data Table
              </Button>
            </div>
          </motion.div>

          <div className="flex gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="w-80 flex-shrink-0"
            >
              <div className="sticky top-8">{sidebar}</div>
            </motion.div>

            <div className="flex-1 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                      <MapIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gradient-accent">
                        Geospatial Analytics
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Interactive mapping with Leaflet & real-time clustering
                      </p>
                    </div>
                  </div>
                  {map}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-neutral-200/50 p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                      <List className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gradient-primary">
                        Data Table & Analytics
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Advanced sorting, filtering & pagination with TanStack
                        Table
                      </p>
                    </div>
                  </div>
                  {table}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Layout */}
      <div className="md:hidden relative">
        {/* Mobile Content */}
        <div className="relative h-[calc(100vh-89px)]">
          {/* Map View */}
          <div
            className={`absolute inset-0 ${mobileView === "map" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full"
            >
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-neutral-200/50 m-4 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-neutral-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                      <MapIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gradient-accent">
                        Map View
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Interactive geospatial data
                      </p>
                    </div>
                  </div>
                </div>
                {map}
              </div>
            </motion.div>
          </div>
          {/* List View */}
          <div
            className={`absolute inset-0 ${mobileView === "list" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full overflow-auto"
            >
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-neutral-200/50 m-4 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-neutral-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                      <List className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gradient-primary">
                        Data Table
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Advanced analytics & filtering
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">{table}</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Filters Overlay */}
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1100]"
            onClick={() => setFiltersOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="absolute left-0 top-0 h-full w-80 bg-background/95 backdrop-blur-xl shadow-2xl border-r border-neutral-200/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-200/50 bg-gradient-to-r from-primary-50/30 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                      <Filter className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gradient-primary">
                      Advanced Filters
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiltersOpen(false)}
                    className="hover:bg-neutral-100 rounded-full w-8 h-8 p-0"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 h-full min-h-0 pb-28">
                {sidebar}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Floating Filter Button */}
        <Button
          className="fixed bottom-6 left-6 z-[1000] rounded-2xl w-14 h-14 shadow-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 border-2 border-white/20"
          onClick={() => setFiltersOpen(true)}
        >
          <Filter className="w-6 h-6 text-white" />
        </Button>
      </div>
    </div>
  );
}
