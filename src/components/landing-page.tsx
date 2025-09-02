"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  Shield,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LandingPage() {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // TODO: Implement file upload logic
    // For now, just redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  const handleUseSampleData = () => {
    // TODO: Load sample data
    router.push("/dashboard");
  };

  const features = [
    {
      icon: BarChart3,
      title: "Price Analysis",
      description: "Understand the competitive pricing landscape in your area",
    },
    {
      icon: TrendingUp,
      title: "Revenue Optimization",
      description: "Maximize your earnings with data-driven pricing strategies",
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Identify high-performing listings and market opportunities",
    },
    {
      icon: Zap,
      title: "Instant Insights",
      description: "Get actionable recommendations in seconds",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Airbnb Pricing Insights
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              Optimize Your{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Airbnb Pricing
              </span>{" "}
              with Data
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload your competitor listings or use our sample data to get
              instant insights into pricing strategies, market trends, and
              revenue optimization.
            </p>

            {/* Upload Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <Button
                  size="lg"
                  className="min-w-[200px] h-12"
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  {isUploading ? "Uploading..." : "Upload CSV"}
                </Button>
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={handleUseSampleData}
                className="min-w-[200px] h-12"
              >
                <FileText className="mr-2 h-5 w-5" />
                Use Austin Texas Data
              </Button>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {features.map((feature, index) => (
                <Card
                  key={feature.title}
                  className="text-center border-0 bg-card/50 backdrop-blur-sm"
                >
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 mx-auto">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps and unlock powerful pricing
              insights
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload Data",
                description:
                  "Upload your CSV file with competitor listings or use our sample dataset",
              },
              {
                step: "2",
                title: "Analyze Insights",
                description:
                  "Explore interactive charts and pricing distributions to understand the market",
              },
              {
                step: "3",
                title: "Optimize Pricing",
                description:
                  "Use our profit calculator to find the optimal price for maximum revenue",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
