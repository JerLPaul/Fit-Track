import { useEffect, useState } from "react";
import styles from "../styles/Dashboard.module.css"
import Link from "next/link";
import Layout from '../layouts/Default';
import useRequireAuth from "../utils/useRequireAuth/useRequireAuth";
import { supabase } from "../utils/SupabaseClient/SupabaseClient";
import { todayISO } from "../utils/dateUtils/dateUtils";

export default function Dashboard() {
    const { user, loading } = useRequireAuth();
    const [stats, setStats] = useState({ loading: true, todayCalories: 0, daysLogged: null, latestWeight: null });

    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            const [todayRes, countRes, weightRes] = await Promise.all([
                supabase
                    .from('food_entries')
                    .select('calories, count')
                    .eq('user_id', user.id)
                    .eq('date', todayISO()),
                supabase
                    .from('food_entries')
                    .select('date', { count: 'exact', head: true })
                    .eq('user_id', user.id),
                supabase
                    .from('weight_entries')
                    .select('weight, unit, date')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false })
                    .limit(1)
                    .maybeSingle(),
            ]);

            const todayCalories = (todayRes.data ?? []).reduce((sum, e) => sum + e.calories * e.count, 0);

            setStats({
                loading: false,
                todayCalories: Math.round(todayCalories),
                daysLogged: countRes.count ?? 0,
                latestWeight: weightRes.data ?? null,
            });
        };

        fetchStats();
    }, [user]);

    if (loading || !user) {
        return (
            <Layout>
                <div className={styles.mainContainer}>
                    <p className={styles.loadingText}>Loading…</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={styles.mainContainer}>
                <div className={styles.greeting}>
                    <h1>Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}</h1>
                    <p>Here's where things stand today.</p>
                </div>

                <div className={styles.statRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.loading ? '—' : stats.todayCalories}</span>
                        <span className={styles.statLabel}>kcal today</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>
                            {stats.loading ? '—' : stats.latestWeight ? `${stats.latestWeight.weight} ${stats.latestWeight.unit}` : '—'}
                        </span>
                        <span className={styles.statLabel}>latest weight</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.loading ? '—' : stats.daysLogged}</span>
                        <span className={styles.statLabel}>entries logged</span>
                    </div>
                </div>

                <div className={styles.optionsGrid}>
                    <Link href="/days" className={styles.option}>
                        <span className={styles.optionIcon}>🗓️</span>
                        <h2>Diary</h2>
                        <p>Log meals and browse any day</p>
                    </Link>
                    <Link href="/progress" className={styles.option}>
                        <span className={styles.optionIcon}>📈</span>
                        <h2>Progress</h2>
                        <p>Weight trends and nutrition averages</p>
                    </Link>
                    <Link href="/search" className={styles.option}>
                        <span className={styles.optionIcon}>🔍</span>
                        <h2>Search Foods</h2>
                        <p>Look up nutrition facts for any food</p>
                    </Link>
                </div>
            </div>
        </Layout>
    );
}
