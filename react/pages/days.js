import Layout from '../layouts/Default';
import styles from "../styles/Days.module.css"
import DiaryDay from "../components/DiaryDay/DiaryDay"
import AddPopup from "../components/AddPopup/AddPopup"
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/SupabaseClient/SupabaseClient";
import useRequireAuth from "../utils/useRequireAuth/useRequireAuth";
import { todayISO, addDays, formatDayLabel } from "../utils/dateUtils/dateUtils";

export default function Days() {
    const { user, loading } = useRequireAuth();
    const [selectedDate, setSelectedDate] = useState(todayISO());
    const [entries, setEntries] = useState([]);
    const [entriesLoading, setEntriesLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [error, setError] = useState(null);

    const fetchEntries = useCallback(async () => {
        if (!user) return;
        setEntriesLoading(true);
        const { data, error } = await supabase
            .from("food_entries")
            .select("*")
            .eq("user_id", user.id)
            .eq("date", selectedDate)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching food entries:", error.message);
            setEntries([]);
        } else {
            setEntries(data ?? []);
        }
        setEntriesLoading(false);
    }, [user, selectedDate]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    // Live-update this day's entries as they change elsewhere (e.g. another tab).
    useEffect(() => {
        if (!user) return;
        const channel = supabase
            .channel(`food-entries-${user.id}-${selectedDate}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "food_entries",
                    filter: `user_id=eq.${user.id}`,
                },
                () => fetchEntries()
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user, selectedDate, fetchEntries]);

    const handleAdd = async (date, newItems) => {
        const rows = newItems.map((item) => ({ ...item, user_id: user.id, date }));
        const { error } = await supabase.from("food_entries").insert(rows);
        if (error) {
            console.error("Error inserting food entries:", error.message);
            setError(error.message);
            throw error;
        }
        setError(null);
        if (date === selectedDate) fetchEntries();
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from("food_entries").delete().eq("id", id);
        if (error) {
            console.error("Error deleting food entry:", error.message);
            return;
        }
        setEntries((prev) => prev.filter((e) => e.id !== id));
    };

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
                <div className={styles.dateNav}>
                    <button
                        className={styles.dateNavButton}
                        onClick={() => setSelectedDate((d) => addDays(d, -1))}
                        aria-label="Previous day"
                    >
                        ‹
                    </button>
                    <div className={styles.dateNavCenter}>
                        <h1>{formatDayLabel(selectedDate)}</h1>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <button
                        className={styles.dateNavButton}
                        onClick={() => setSelectedDate((d) => addDays(d, 1))}
                        aria-label="Next day"
                        disabled={selectedDate >= todayISO()}
                    >
                        ›
                    </button>
                </div>

                {error && <p className={styles.error}>Couldn't save: {error}</p>}

                <DiaryDay entries={entries} loading={entriesLoading} onDelete={handleDelete} />

                {isVisible && (
                    <AddPopup onClose={() => setIsVisible(false)} onAdd={handleAdd} defaultDate={selectedDate} />
                )}

                <div className={styles.buttonContainer}>
                    <button className={styles.addButton} onClick={() => setIsVisible(true)} aria-label="Add foods">
                        +
                    </button>
                </div>
            </div>
        </Layout>
    );
}
