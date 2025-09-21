"use client";

import { motion } from "framer-motion";
import { BarChart3, List, MapIcon } from "lucide-react";
import type React from "react";

interface DesktopLayoutProps {
  sidebar: React.ReactElement;
  map: React.ReactElement;
  table: React.ReactElement;
}

export function DesktopLayout({ sidebar, map, table }: DesktopLayoutProps) {
  return (
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
  );
}