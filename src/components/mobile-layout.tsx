"use client";

import { Filter, List, MapIcon, Star } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/contexts/dashboard-context";

interface MobileLayoutProps {
  map: React.ReactElement;
  table: React.ReactElement;
  sidebar: React.ReactElement;
}

export function MobileLayout({ map, table, sidebar }: MobileLayoutProps) {
  const { mobileView, filtersOpen, setFiltersOpen, setMobileView } =
    useDashboard();

  return (
    <div className="md:hidden relative h-[calc(100vh-83px)] flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 pt-3 pl-3">
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
      {/* Mobile Content */}
      <div className="relative h-[calc(100vh-89px)]">
        {/* Map View */}
        <div
          className={`absolute inset-0 ${mobileView === "map" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full p-4"
          >
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-lg overflow-hidden h-full flex flex-col">
              <div className="p-4 border-b border-neutral-200/50 flex-shrink-0">
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
              <div className="flex-1">
                {map}
              </div>
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
            className="h-full p-4"
          >
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-neutral-200/50 shadow-lg overflow-hidden h-full flex flex-col">
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
              <div className="p-4 h-full overflow-auto">{table}</div>
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
  );
}
