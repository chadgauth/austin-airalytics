"use client";

import { motion } from "framer-motion";
import { BarChart3, Shield, Sparkles, Zap } from "lucide-react";

export function HeroSection() {
  const features = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep insights into rental performance and market trends",
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Comprehensive risk scoring for informed decisions",
    },
    {
      icon: Zap,
      title: "Real-time Data",
      description: "Live updates and instant analysis of your portfolio",
    },
  ];

  return (
    <section className="relative py-12 lg:py-20">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Advanced AI Analytics</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
            Transform Your{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Rental Portfolio
            </span>{" "}
            with Data-Driven Insights
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unlock the full potential of your Airbnb listings with comprehensive
            analytics, risk assessment, and market intelligence to maximize
            revenue and minimize risks.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
