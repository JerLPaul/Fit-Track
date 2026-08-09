import styles from "./Groups.module.css";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../../utils/SupabaseClient/SupabaseClient";
import { UserContext } from "../../utils/UserContext/UserContext";

function formatDate(dateStr) {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });
}

export default function Groups({ refreshKey }) {
    const { user } = useContext(UserContext);
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDays = async () => {
        if (!user) return;
        setLoading(true);
        // Bug fix: this used to query the "Day" table with no filter at all,
        // so every signed-in user saw and could edit every other user's
        // food log. It's now scoped to the current user (also enforced
        // server-side by Row Level Security, see supabase/schema.sql).
        const { data, error } = await supabase
            .from("Day")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false });

        if (error) {
            console.error("Error fetching days from Supabase:", error.message);
            setDays([]);
            setLoading(false);
            return;
        }

        // food_list is stored as jsonb, so it already comes back as an
        // array -- no JSON.parse needed (the previous version parsed a
        // JSON string here, which broke as soon as the column was jsonb).
        setDays(data ?? []);
        setLoading(false);
    };

    useEffect(() => {
        fetchDays();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, refreshKey]);

    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`day-changes-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "Day",
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    // Re-fetch on any change rather than hand-splicing the
                    // payload into state -- the previous INSERT handler
                    // pushed the raw (still-JSON-string) payload into state
                    // with a different shape than the initial parsed fetch,
                    // so newly-added days rendered broken until a refresh.
                    fetchDays();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleDelete = async (id) => {
        const { error } = await supabase.from("Day").delete().eq("id", id);
        if (error) {
            console.error("Error deleting day:", error.message);
            return;
        }
        setDays((prev) => prev.filter((day) => day.id !== id));
    };

    if (loading) {
        return <p className={styles.status}>Loading your days…</p>;
    }

    if (days.length === 0) {
        return <p className={styles.status}>No days logged yet — tap “+” to add your first meal.</p>;
    }

    return (
        <div className={styles.groupsContainer}>
            {days.map((day) => {
                const foodList = Array.isArray(day.food_list) ? day.food_list : [];
                const byMeal = foodList.reduce((acc, item) => {
                    const meal = item.meal || 'Other';
                    (acc[meal] = acc[meal] || []).push(item);
                    return acc;
                }, {});

                const dayTotals = foodList.reduce(
                    (acc, item) => {
                        const macros = item.macros || {};
                        const count = item.count || 1;
                        acc.calories += (macros.calories || 0) * count;
                        acc.fat += (macros.fat || 0) * count;
                        acc.carbs += (macros.carbs || 0) * count;
                        acc.protein += (macros.protein || 0) * count;
                        return acc;
                    },
                    { calories: 0, fat: 0, carbs: 0, protein: 0 }
                );

                return (
                    <div key={day.id} className={styles.groupCard}>
                        <div className={styles.groupCardHeader}>
                            <h3>{formatDate(day.date)}</h3>
                            <button
                                className={styles.deleteButton}
                                onClick={() => handleDelete(day.id)}
                                aria-label={`Delete ${day.date}`}
                            >
                                Delete
                            </button>
                        </div>

                        <div className={styles.dayTotals}>
                            <span>{Math.round(dayTotals.calories)} kcal</span>
                            <span>{Math.round(dayTotals.fat)}g fat</span>
                            <span>{Math.round(dayTotals.carbs)}g carbs</span>
                            <span>{Math.round(dayTotals.protein)}g protein</span>
                        </div>

                        {Object.keys(byMeal).length > 0 ? (
                            Object.entries(byMeal).map(([meal, items]) => (
                                <div key={meal} className={styles.mealBlock}>
                                    <h4>{meal}</h4>
                                    <ul className={styles.foodList}>
                                        {items.map((item, index) => (
                                            <li key={index} className={styles.foodItem}>
                                                <span>{item.name}{item.count > 1 ? ` ×${item.count}` : ''}</span>
                                                <span className={styles.foodCalories}>
                                                    {Math.round((item.macros?.calories || 0) * (item.count || 1))} kcal
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <p className={styles.status}>No food items available</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
