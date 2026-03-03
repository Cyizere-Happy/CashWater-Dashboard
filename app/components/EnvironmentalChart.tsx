"use client";

import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import StreamingPlugin from "chartjs-plugin-streaming";
import "chartjs-adapter-moment";
import { useTheme } from "next-themes";
import { useEffect, useRef, useMemo } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  StreamingPlugin,
);

interface EnvironmentalChartProps {
  revenue: number | null;
  consumption: number | null;
}

export default function EnvironmentalChart({
  revenue,
  consumption,
}: EnvironmentalChartProps) {
  const { theme } = useTheme();
  const chartRef = useRef<any>(null);
  const dataRef = useRef({ revenue, consumption });

  useEffect(() => {
    dataRef.current = { revenue, consumption };
  }, [revenue, consumption]);

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest" as const, intersect: false },
      plugins: {
        legend: { display: false },
        streaming: {
          duration: 60000,
          refresh: 1000,
          delay: 2000,
          frameRate: 30,
          onRefresh: (chart: any) => {
            const now = Date.now();
            const { revenue: r, consumption: c } = dataRef.current;
            if (r !== null) {
              chart.data.datasets[0].data.push({
                x: now,
                y: r + (Math.random() * 100 - 50),
              });
            }
            if (c !== null) {
              chart.data.datasets[1].data.push({
                x: now,
                y: 50 + (Math.random() * 10 - 5),
              });
            }
          },
        },
      } as any,
      scales: {
        x: {
          type: "realtime" as any,
          grid: { display: false },
          ticks: { color: theme === "dark" ? "#94a3b8" : "#64748b" },
        },
        y: {
          beginAtZero: false,
          grid: {
            color:
              theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          },
          ticks: { color: theme === "dark" ? "#94a3b8" : "#64748b" },
        },
      },
    }),
    [theme],
  );

  const data = useMemo(
    () => ({
      datasets: [
        {
          label: "Revenue ($)",
          data: [],
          borderColor: "#62a9e3",
          backgroundColor: "rgba(98, 169, 227, 0.1)",
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 0,
        },
        {
          label: "Consumption (L)",
          data: [],
          borderColor: "#87c4c4",
          backgroundColor: "rgba(135, 196, 196, 0.1)",
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 0,
        },
      ],
    }),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
      className="bg-[var(--bg-card)] rounded-3xl p-8 shadow-[var(--card-shadow)] border border-[var(--border-color)] flex-1"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg text-[var(--text-main)]">
          Revenue &amp; Usage Trends
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-orange)]" />
            Revenue
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-teal)]" />
            Consumption
          </div>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <Line
          ref={chartRef}
          options={options}
          data={data}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </motion.div>
  );
}
