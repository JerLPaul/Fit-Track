import Layout from '../layouts/Default';
import styles from "../styles/Days.module.css"
import Groups from "../components/Groups/Groups"
import AddPopup from "../components/AddPopup/AddPopup"
import { useState } from "react";
import { supabase } from "../utils/SupabaseClient/SupabaseClient";
import useRequireAuth from "../utils/useRequireAuth/useRequireAuth";

export default function Days() {
    const { user, loading } = useRequireAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [saveError, setSaveError] = useState(null);

    const handleAdd = async (date, newItems) => {
        // Bug fix: adding food used to always INSERT a brand new row, so
        // logging more than one meal on the same day created several
        // separate (and separately-rendered) "days" instead of one growing
        // day. We now merge into the existing row for that date if there
        // is one, which is also what makes "add another group of foods to
        // today" a one-tap action instead of hunting for the right card.
        const { data: existing, error: fetchError } = await supabase
            .from("Day")
            .select("id, food_list")
            .eq("user_id", user.id)
            .eq("date", date)
            .maybeSingle();

        if (fetchError) {
            console.error("Error checking for existing day:", fetchError.message);
            setSaveError(fetchError.message);
            throw fetchError;
        }

        if (existing) {
            const mergedList = [...(existing.food_list || []), ...newItems];
            const { error } = await supabase
                .from("Day")
                .update({ food_list: mergedList })
                .eq("id", existing.id);
            if (error) {
                console.error("Error updating day:", error.message);
                setSaveError(error.message);
                throw error;
            }
        } else {
            const { error } = await supabase
                .from("Day")
                .insert([{ user_id: user.id, date, food_list: newItems }]);
            if (error) {
                console.error("Error inserting day:", error.message);
                setSaveError(error.message);
                throw error;
            }
        }

        setSaveError(null);
        setRefreshKey((k) => k + 1);
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
                <div className={styles.header}>
                    <h1>My Days</h1>
                    <button className={styles.addButtonInline} onClick={() => setIsVisible(true)}>
                        + Add foods
                    </button>
                </div>

                {saveError && <p className={styles.error}>Couldn't save: {saveError}</p>}

                <Groups refreshKey={refreshKey} />

                {isVisible && (
                    <AddPopup onClose={() => setIsVisible(false)} onAdd={handleAdd} />
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
