import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../layouts/Default';
import styles from '../styles/Progress.module.css';
import TrendChart from '../components/TrendChart/TrendChart';
import WeightForm from '../components/WeightForm/WeightForm';
import useRequireAuth from '../utils/useRequireAuth/useRequireAuth';
import { supabase } from '../utils/SupabaseClient/SupabaseClient';
import { daysAgoISO, todayISO } from '../utils/dateUtils/dateUtils';
import {
    dailyCalorieTotals,
    weeklyAverages,
    monthlyAverages,
    weightSeries,
    weightWeeklyAverages,
    weightMonthlyAverages,
} from '../utils/aggregations/aggregations';

const RANGE_OPTIONS = [
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
    { label: '1 year', days: 365 },
];

export default function ProgressPage() {
    const { user, loading } = useRequireAuth();
    const [tab, setTab] = useState('nutrition'); // 'nutrition' | 'weight'
    const [rangeDays, setRangeDays] = useState(30);
    const [foodEntries, setFoodEntries] = useState([]);
    const [weightEntries, setWeightEntries] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [showWeightForm, setShowWeightForm] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setDataLoading(true);
        const since = daysAgoISO(rangeDays);

        const [foodRes, weightRes] = await Promise.all([
            supabase
                .from('food_entries')
                .select('date, calories, fat, carbs, protein, count')
                .eq('user_id', user.id)
                .gte('date', since),
            supabase
                .from('weight_entries')
                .select('id, date, weight, unit, note')
                .eq('user_id', user.id)
                .gte('date', since)
                .order('date', { ascending: true }),
        ]);

        if (foodRes.error) console.error('Error fetching food entries:', foodRes.error.message);
        if (weightRes.error) console.error('Error fetching weight entries:', weightRes.error.message);

        setFoodEntries(foodRes.data ?? []);
        setWeightEntries(weightRes.data ?? []);
        setDataLoading(false);
    }, [user, rangeDays]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const dailyTotals = useMemo(() => dailyCalorieTotals(foodEntries), [foodEntries]);
    const weeklyCal = useMemo(() => weeklyAverages(dailyTotals), [dailyTotals]);
    const monthlyCal = useMemo(() => monthlyAverages(dailyTotals), [dailyTotals]);

    const weightTrend = useMemo(() => weightSeries(weightEntries), [weightEntries]);
    const weeklyWeight = useMemo(() => weightWeeklyAverages(weightEntries), [weightEntries]);
    const monthlyWeight = useMemo(() => weightMonthlyAverages(weightEntries), [weightEntries]);

    const avgCalories = dailyTotals.length
        ? Math.round(dailyTotals.reduce((s, d) => s + d.calories, 0) / dailyTotals.length)
        : null;

    const latestWeight = weightEntries[weightEntries.length - 1];
    const firstWeight = weightEntries[0];
    const weightChange = latestWeight && firstWeight && latestWeight.id !== firstWeight.id
        ? Math.round((latestWeight.weight - firstWeight.weight) * 10) / 10
        : null;

    const handleSaveWeight = async ({ date, weight, unit, note }) => {
        const { error } = await supabase
            .from('weight_entries')
            .upsert(
                [{ user_id: user.id, date, weight, unit, note }],
                { onConflict: 'user_id,date' }
            );
        if (error) throw error;
        setShowWeightForm(false);
        fetchData();
    };

    if (loading || !user) {
        return (
            <Layout>
                <div className={styles.container}>
                    <p className={styles.status}>Loading…</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Progress</h1>
                    <div className={styles.rangeSelect}>
                        {RANGE_OPTIONS.map((opt) => (
                            <button
                                key={opt.days}
                                className={rangeDays === opt.days ? styles.rangeActive : styles.rangeButton}
                                onClick={() => setRangeDays(opt.days)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={tab === 'nutrition' ? styles.tabActive : styles.tab}
                        onClick={() => setTab('nutrition')}
                    >
                        Nutrition
                    </button>
                    <button
                        className={tab === 'weight' ? styles.tabActive : styles.tab}
                        onClick={() => setTab('weight')}
                    >
                        Weight
                    </button>
                </div>

                {dataLoading ? (
                    <p className={styles.status}>Loading your data…</p>
                ) : tab === 'nutrition' ? (
                    <NutritionTab
                        dailyTotals={dailyTotals}
                        weeklyCal={weeklyCal}
                        monthlyCal={monthlyCal}
                        avgCalories={avgCalories}
                        rangeDays={rangeDays}
                    />
                ) : (
                    <WeightTab
                        weightTrend={weightTrend}
                        weeklyWeight={weeklyWeight}
                        monthlyWeight={monthlyWeight}
                        latestWeight={latestWeight}
                        weightChange={weightChange}
                        showForm={showWeightForm}
                        onToggleForm={() => setShowWeightForm((v) => !v)}
                        onSave={handleSaveWeight}
                    />
                )}
            </div>
        </Layout>
    );
}

function NutritionTab({ dailyTotals, weeklyCal, monthlyCal, avgCalories, rangeDays }) {
    return (
        <div>
            <div className={styles.statRow}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{avgCalories ?? '—'}</span>
                    <span className={styles.statLabel}>avg kcal/day ({rangeDays}d)</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{dailyTotals.length}</span>
                    <span className={styles.statLabel}>days logged</span>
                </div>
            </div>

            <section className={styles.section}>
                <h2>Daily calories</h2>
                <TrendChart data={dailyTotals} dataKey="calories" unit=" kcal" />
            </section>

            <section className={styles.section}>
                <h2>Weekly average</h2>
                <TrendChart data={weeklyCal} dataKey="average" unit=" kcal" color="var(--color-accent)" />
            </section>

            <section className={styles.section}>
                <h2>Monthly average</h2>
                {monthlyCal.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr><th>Month</th><th>Avg kcal/day</th></tr>
                        </thead>
                        <tbody>
                            {monthlyCal.map((m) => (
                                <tr key={m.label}><td>{m.label}</td><td>{m.average}</td></tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className={styles.status}>Not enough data yet.</p>
                )}
            </section>
        </div>
    );
}

function WeightTab({ weightTrend, weeklyWeight, monthlyWeight, latestWeight, weightChange, showForm, onToggleForm, onSave }) {
    return (
        <div>
            <div className={styles.statRow}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>
                        {latestWeight ? `${latestWeight.weight} ${latestWeight.unit}` : '—'}
                    </span>
                    <span className={styles.statLabel}>latest weigh-in</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>
                        {weightChange === null ? '—' : `${weightChange > 0 ? '+' : ''}${weightChange}`}
                    </span>
                    <span className={styles.statLabel}>change over range</span>
                </div>
            </div>

            {showForm ? (
                <div className={styles.formWrapper}>
                    <WeightForm onSave={onSave} onCancel={onToggleForm} defaultUnit={latestWeight?.unit || 'lb'} />
                </div>
            ) : (
                <button className={styles.logButton} onClick={onToggleForm}>
                    + Log weight
                </button>
            )}

            <section className={styles.section}>
                <h2>Weight trend</h2>
                <TrendChart data={weightTrend} dataKey="weight" unit={latestWeight?.unit ? ` ${latestWeight.unit}` : ''} color="var(--color-accent)" />
            </section>

            <section className={styles.section}>
                <h2>Weekly average</h2>
                <TrendChart data={weeklyWeight} dataKey="average" unit={latestWeight?.unit ? ` ${latestWeight.unit}` : ''} />
            </section>

            <section className={styles.section}>
                <h2>Monthly average</h2>
                {monthlyWeight.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr><th>Month</th><th>Avg weight</th></tr>
                        </thead>
                        <tbody>
                            {monthlyWeight.map((m) => (
                                <tr key={m.label}><td>{m.label}</td><td>{m.average}</td></tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className={styles.status}>Not enough data yet.</p>
                )}
            </section>
        </div>
    );
}
