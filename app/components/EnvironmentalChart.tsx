'use client';

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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import StreamingPlugin from 'chartjs-plugin-streaming';
import 'chartjs-adapter-moment';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useMemo } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    StreamingPlugin
);

interface EnvironmentalChartProps {
    revenue: number | null;         // Org metric — kept, feeds dataset 1
    flowRate: number | null;        // L/min from hardware — feeds dataset 2
    totalVolume: number | null;     // Cumulative litres — feeds dataset 3
}

export default function EnvironmentalChart({ revenue, flowRate, totalVolume }: EnvironmentalChartProps) {
    const { theme } = useTheme();
    const chartRef = useRef<any>(null);
    const dataRef = useRef({ revenue, flowRate, totalVolume });

    useEffect(() => {
        dataRef.current = { revenue, flowRate, totalVolume };
    }, [revenue, flowRate, totalVolume]);

    const options: ChartOptions<'line'> = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'nearest' as const, intersect: false },
        plugins: {
            legend: { display: false },
            streaming: {
                duration: 60000,
                refresh: 1000,
                delay: 2000,
                frameRate: 30,
                onRefresh: (chart: any) => {
                    const now = Date.now();
                    const { revenue: r, flowRate: f, totalVolume: v } = dataRef.current;

                    // Dataset 0: Revenue (org metric — kept, small simulated drift)
                    if (r !== null) {
                        chart.data.datasets[0].data.push({ x: now, y: r + (Math.random() * 100 - 50) });
                    }
                    // Dataset 1: Live flow rate from hardware (L/min)
                    // If no signal yet, push a 0 so the line is visible but flat
                    chart.data.datasets[1].data.push({ x: now, y: f !== null ? f : 0 });

                    // Dataset 2: Total volume accumulated (right y-axis scale)
                    if (v !== null) {
                        chart.data.datasets[2].data.push({ x: now, y: v });
                    }
                }
            },
        } as any,
        scales: {
            x: {
                type: 'realtime' as any,
                grid: { display: false },
                ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' },
            },
            y: {
                beginAtZero: false,
                position: 'left' as const,
                grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' },
            },
            yFlow: {
                beginAtZero: true,
                position: 'right' as const,
                grid: { display: false },
                ticks: {
                    color: theme === 'dark' ? '#87c4c4' : '#4d9999',
                    callback: (val: any) => `${val} L/m`,
                },
            },
        },
    }), [theme]);

    const data = useMemo(() => ({
        datasets: [
            {
                label: 'Revenue ($)',
                data: [],
                borderColor: '#62a9e3',
                backgroundColor: 'rgba(98, 169, 227, 0.08)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: 'Flow Rate (L/min)',
                data: [],
                borderColor: '#87c4c4',
                backgroundColor: 'rgba(135, 196, 196, 0.15)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 0,
                yAxisID: 'yFlow',
            },
            {
                label: 'Volume Used (L)',
                data: [],
                borderColor: '#eb807d',
                backgroundColor: 'rgba(235, 128, 125, 0.08)',
                fill: false,
                tension: 0.4,
                borderWidth: 2,
                borderDash: [6, 3],
                pointRadius: 0,
                yAxisID: 'y',
            },
        ],
    }), []);

    return (
        <div className="bg-[var(--bg-card)] rounded-3xl p-8 shadow-[var(--card-shadow)] border border-[var(--border-color)] flex-1">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-[var(--text-main)]">Revenue & Water Flow</h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-orange)]" />
                        Revenue
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-teal)]" />
                        Flow Rate
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-pink)]" />
                        Volume
                    </div>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <Line ref={chartRef} options={options} data={data} style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
}
