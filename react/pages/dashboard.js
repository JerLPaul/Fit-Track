import { useEffect, useState } from "react";
import styles from "../styles/Dashboard.module.css"
import Link from "next/link";
import Layout from '../layouts/Default';
import useRequireAuth from "../utils/useRequireAuth/useRequireAuth";
import { supabase } from "../utils/SupabaseClient/SupabaseClient";

export default function Dashboard() {
    const { user, loading } = useRequireAuth();
    const [daysLogged, setDaysLogged] = useState(null);

    useEffect(() => {
        if (!user) return;
        supabase
            .from("Day")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .then(({ count, error }) => {
                if (!error) setDaysLogged(count ?? 0);
            });
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
                    <p>{daysLogged === null ? 'Loading your stats…' : `${daysLogged} day${daysLogged === 1 ? '' : 's'} logged so far.`}</p>
                </div>

                <div className={styles.optionsGrid}>
                    <Link href="/days" className={styles.option}>
                        <span className={styles.optionIcon}>🗓️</span>
                        <h2>My Days</h2>
                        <p>View and add to your logged meals</p>
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
