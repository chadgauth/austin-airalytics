import type React from "react";
import { DesktopLayout } from "@/components/desktop-layout";
import { MobileLayout } from "@/components/mobile-layout";
import { PageHeader } from "@/components/page-header";

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
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Austin Airbnb Analytics"
        subtitle="Interactive dashboard for rental market insights"
      />
      <DesktopLayout sidebar={sidebar} map={map} table={table} />

      <MobileLayout map={map} table={table} sidebar={sidebar} />
    </div>
  );
}