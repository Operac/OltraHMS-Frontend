import { useMemo } from 'react';

interface ChartDataPoint {
    date: string;
    value: number;
    label?: string;
}

interface TrendChartProps {
    data: ChartDataPoint[];
    title?: string;
    color?: string;
    height?: number;
    showDots?: boolean;
    unit?: string;
}

export function TrendChart({ 
    data, 
    title, 
    color = '#3B82F6', 
    height = 150,
    showDots = true,
    unit = ''
}: TrendChartProps) {
    const chartData = useMemo(() => {
        if (data.length === 0) return null;
        
        const values = data.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const range = maxValue - minValue || 1;
        
        const width = 100;
        const padding = 10;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        const points = data.map((d, i) => {
            const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
            const y = padding + chartHeight - ((d.value - minValue) / range) * chartHeight;
            return { x, y, ...d };
        });
        
        // Create SVG path
        const path = points.length > 1 
            ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
            : '';
            
        // Create area fill
        const areaPath = points.length > 1
            ? `M ${padding},${padding + chartHeight} L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${width - padding},${padding + chartHeight} Z`
            : '';
        
        return { points, path, areaPath, minValue, maxValue };
    }, [data, height]);
    
    if (!chartData || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                <p className="text-gray-400 text-sm">No data available</p>
            </div>
        );
    }
    
    return (
        <div className="w-full">
            {title && <h4 className="text-sm font-medium text-gray-600 mb-2">{title}</h4>}
            <svg viewBox="0 0 100 150" className="w-full" style={{ height }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pos, i) => (
                    <line 
                        key={i}
                        x1="10" 
                        y1={10 + pos * (height - 20)} 
                        x2="90" 
                        y2={10 + pos * (height - 20)} 
                        stroke="#E5E7EB" 
                        strokeWidth="0.5" 
                    />
                ))}
                
                {/* Area fill */}
                {chartData.areaPath && (
                    <path 
                        d={chartData.areaPath} 
                        fill={color} 
                        fillOpacity="0.1" 
                    />
                )}
                
                {/* Line */}
                {chartData.path && (
                    <path 
                        d={chartData.path} 
                        fill="none" 
                        stroke={color} 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                )}
                
                {/* Dots */}
                {showDots && chartData.points.map((point, i) => (
                    <circle 
                        key={i}
                        cx={point.x} 
                        cy={point.y} 
                        r="2" 
                        fill={color}
                    />
                ))}
                
                {/* Y-axis labels */}
                <text x="5" y="15" fontSize="5" fill="#9CA3AF">
                    {chartData.maxValue}{unit}
                </text>
                <text x="5" y={height - 5} fontSize="5" fill="#9CA3AF">
                    {chartData.minValue}{unit}
                </text>
            </svg>
            
            {/* X-axis labels */}
            <div className="flex justify-between mt-1 px-2">
                {data.slice(0, 5).map((d, i) => (
                    <span key={i} className="text-xs text-gray-400">
                        {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                ))}
            </div>
        </div>
    );
}

// =============================================================================
// Summary Charts Component
// =============================================================================
interface WellnessSummaryChartsProps {
    vitals: any[];
    moods: any[];
    sleep: any[];
}

export function WellnessSummaryCharts({ vitals, moods, sleep }: WellnessSummaryChartsProps) {
    // Process data for charts
    const moodData = useMemo(() => {
        return moods.slice(0, 14).reverse().map(m => ({
            date: m.recordedAt,
            value: m.moodScore
        }));
    }, [moods]);
    
    const sleepData = useMemo(() => {
        return sleep.slice(0, 14).reverse().map(s => ({
            date: s.recordedAt,
            value: s.duration ? Math.round(s.duration / 60 * 10) / 10 : 0
        }));
    }, [sleep]);
    
    const bpData = useMemo(() => {
        return vitals
            .filter(v => v.type === 'BLOOD_PRESSURE')
            .slice(0, 10)
            .reverse()
            .map(v => ({
                date: v.recordedAt,
                value: v.value,
                label: `${v.value}/${v.value2}`
            }));
    }, [vitals]);
    
    const hrData = useMemo(() => {
        return vitals
            .filter(v => v.type === 'HEART_RATE')
            .slice(0, 10)
            .reverse()
            .map(v => ({
                date: v.recordedAt,
                value: v.value
            }));
    }, [vitals]);
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mood Trend */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
                <TrendChart 
                    data={moodData} 
                    title="Mood Trend (14 days)" 
                    color="#F59E0B"
                    unit="/10"
                />
            </div>
            
            {/* Sleep Trend */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
                <TrendChart 
                    data={sleepData} 
                    title="Sleep Hours (14 days)" 
                    color="#7C3AED"
                    unit="h"
                />
            </div>
            
            {/* Blood Pressure Trend */}
            {bpData.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <TrendChart 
                        data={bpData} 
                        title="Blood Pressure (mmHg)" 
                        color="#DC2626"
                        unit=""
                    />
                </div>
            )}
            
            {/* Heart Rate Trend */}
            {hrData.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <TrendChart 
                        data={hrData} 
                        title="Heart Rate (bpm)" 
                        color="#EC4899"
                        unit=" bpm"
                    />
                </div>
            )}
        </div>
    );
}

// =============================================================================
// Progress Ring Component
// =============================================================================
interface ProgressRingProps {
    value: number;
    max: number;
    size?: number;
    color?: string;
    label?: string;
}

export function ProgressRing({ 
    value, 
    max, 
    size = 80, 
    color = '#3B82F6',
    label 
}: ProgressRingProps) {
    const percentage = Math.min((value / max) * 100, 100);
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="text-center -mt-4">
                <span className="text-lg font-bold">{value}</span>
                {label && <span className="text-xs text-gray-500 ml-1">{label}</span>}
            </div>
        </div>
    );
}

// =============================================================================
// Stat Card with Trend
// =============================================================================
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon?: React.ReactNode;
    color?: string;
}

export function StatCard({ 
    title, 
    value, 
    subtitle, 
    trend, 
    trendValue,
    icon,
    color = '#3B82F6'
}: StatCardProps) {
    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-600';
        if (trend === 'down') return 'text-red-600';
        return 'text-gray-600';
    };
    
    const getTrendIcon = () => {
        if (trend === 'up') return '↑';
        if (trend === 'down') return '↓';
        return '→';
    };
    
    return (
        <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                {icon && (
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                        {icon}
                    </div>
                )}
            </div>
            {trend && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor()}`}>
                    <span>{getTrendIcon()}</span>
                    {trendValue && <span>{trendValue}</span>}
                </div>
            )}
        </div>
    );
}
