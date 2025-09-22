"use client";

import { BarChart3, List, MapIcon } from "lucide-react";
import { motion } from "motion/react";
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
                <div className="h-80 sm:h-96 lg:h-[500px]">
                  {map}
                </div>
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
