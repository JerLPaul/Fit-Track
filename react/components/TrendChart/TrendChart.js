import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import styles from './TrendChart.module.css';

export default function TrendChart({ data, dataKey, xKey = 'label', unit = '', color = 'var(--color-primary)', height = 220 }) {
    if (!data || data.length === 0) {
        return <p className={styles.empty}>Not enough data yet to chart a trend.</p>;
    }

    return (
        <div className={styles.chartWrapper} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                        dataKey={xKey}
                        tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                        axisLine={{ stroke: 'var(--color-border)' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                        domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip
                        formatter={(value) => [`${value}${unit}`, undefined]}
                        contentStyle={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 8,
                            fontSize: 12,
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: color, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
