"use client";

import { PropertiesByStatusChart } from "./properties-by-status-chart";
import { InquiriesOverTimeChart } from "./inquiries-over-time-chart";
import { PropertiesByCityChart } from "./properties-by-city-chart";

interface ChartData {
  propertiesByStatus: { status: string; count: number }[];
  propertiesByCity: { city: string; count: number }[];
  inquiriesByMonth: { month: string; count: number }[];
  projectsCount: number;
  unitsCount: number;
}

export function DashboardCharts({ chartData }: { chartData: ChartData }) {
  return (
    <div className="dashboard-charts">
      <div className="chart-card">
        <h3>Properties by Status</h3>
        <PropertiesByStatusChart data={chartData.propertiesByStatus} />
      </div>
      <div className="chart-card">
        <h3>Inquiries Over Time</h3>
        <InquiriesOverTimeChart data={chartData.inquiriesByMonth} />
      </div>
      <div className="chart-card" style={{ gridColumn: "1 / -1" }}>
        <h3>Properties by City</h3>
        <PropertiesByCityChart data={chartData.propertiesByCity} />
      </div>
    </div>
  );
}
