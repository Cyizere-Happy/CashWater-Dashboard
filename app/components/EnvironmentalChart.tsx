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
import { useEffect, useRef } from 'react';

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
    temperature: number | null;
    humidity: number | null;
}

export default function EnvironmentalChart({ temperature, humidity }: EnvironmentalChartProps) {
    const { theme } = useTheme();
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (chartRef.current && (temperature !== null || humidity !== null)) {
            const chart = chartRef.current;
            const now = Date.now();
            if (temperature !== null) {
                chart.data.datasets[0].data.push({ x: now, y: temperature });
            }
            if (humidity !== null) {
                chart.data.datasets[1].data.push({ x: now, y: humidity });
            }
            chart.update('quiet');
        }
    }, [temperature, humidity]);

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'nearest', intersect: false },
        plugins: {
            legend: { display: false },
            streaming: {
                duration: 60000,
                refresh: 1000,
                delay: 2000,
                frameRate: 30,
            },
        } as any, // Streaming plugin options type bypass
        scales: {
            x: {
                type: 'realtime' as any,
                grid: { display: false },
                ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' },
            },
            y: {
                beginAtZero: false,
                grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' },
            },
        },
    };

    const data = {
        datasets: [
            {
                label: 'Temp (°C)',
                data: [],
                borderColor: '#62a9e3',
                backgroundColor: 'rgba(98, 169, 227, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 0,
            },
            {
                label: 'Humidity (%)',
                data: [],
                borderColor: '#87c4c4',
                backgroundColor: 'rgba(135, 196, 196, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 0,
            },
        ],
    };

    return (
        <div className="bg-[var(--bg-card)] rounded-3xl p-8 shadow-[var(--card-shadow)] border border-[var(--border-color)] flex-1">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-[var(--text-main)]">Environmental History</h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-orange)]" />
                        Temp
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-teal)]" />
                        Humidity
                    </div>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <Line ref={chartRef} options={options} data={data} style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
}
