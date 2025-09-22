"use client";

import { ArrowRight, BarChart3, Globe } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <motion.section
      className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-background to-accent-50 dark:from-primary-950 dark:via-background dark:to-accent-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="text-gradient-primary">Rental Insight Pro</span>
            <br />
            <span className="text-foreground">Austin Airbnb Analytics</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            A comprehensive case study showcasing advanced analytics for
            Austin's Airbnb market. Built with Next.js 15, tRPC, Supabase, and
            modern web technologies to deliver unparalleled insights into rental
            property performance.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/listings">
                <BarChart3 className="mr-2 h-5 w-5" />
                Explore Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8 py-6"
            >
              <Link href="/featured">
                <Globe className="mr-2 h-5 w-5" />
                Featured Listings
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
