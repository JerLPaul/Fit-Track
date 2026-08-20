import styles from "./AddPopup.module.css";
import SearchList from "../SearchList/SearchList";
import ListItem from "../ListItem/ListItem";
import { useMemo, useState } from "react";
import { todayISO } from "../../utils/dateUtils/dateUtils";

const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function AddPopup({ onClose, onAdd, defaultDate }) {
    const [input, setInput] = useState('');
    const [dateInput, setDateInput] = useState(defaultDate || todayISO());
    const [meal, setMeal] = useState(MEALS[0]);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    // Map<name, { description, count, meal }>
    const [list, setList] = useState(new Map());

    
    const total = useMemo(() => {
        const sums = { calories: 0, fat: 0, carbs: 0, protein: 0 };
        for (const { description, count } of list.values()) {
            sums.calories += description.macros.calories * count;
            sums.fat += description.macros.fat * count;
            sums.carbs += description.macros.carbs * count;
            sums.protein += description.macros.protein * count;
        }
        return sums;
    }, [list]);

    const addToList = (name, description) => {
        setList((prev) => {
            const next = new Map(prev);
            const existing = next.get(name);
            if (existing) {
                next.set(name, { ...existing, count: existing.count + 1 });
            } else {
                next.set(name, { description, count: 1, meal });
            }
            return next;
        });
    };

    const setCount = (name, count) => {
        setList((prev) => {
            const next = new Map(prev);
            const existing = next.get(name);
            if (!existing) return prev;
            if (count <= 0) {
                next.delete(name);
            } else {
                next.set(name, { ...existing, count });
            }
            return next;
        });
    };

    const handleAdd = async () => {
        if (!dateInput) {
            setError("NO_DATE");
            return;
        }
        if (list.size === 0) {
            setError("NO_ITEMS");
            return;
        }
        setError(null);

        const listArray = Array.from(list.entries()).map(([name, { description, count, meal }]) => ({
            name,
            meal,
            count,
            serving: description.serving,
            calories: description.macros.calories,
            fat: description.macros.fat,
            carbs: description.macros.carbs,
            protein: description.macros.protein,
        }));

        setSaving(true);
        try {
            await onAdd(dateInput, listArray);
            onClose();
        } catch (err) {
            setError("SAVE_FAILED");
            setSaving(false);
        }
    };

    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.popupHeader}>
                    <h2>Add foods</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>

                <div className={styles.metaRow}>
                    <label className={styles.metaField}>
                        <span>Date</span>
                        <input
                            type="date"
                            value={dateInput}
                            onChange={(e) => setDateInput(e.target.value)}
                        />
                    </label>
                    <label className={styles.metaField}>
                        <span>Meal</span>
                        <select value={meal} onChange={(e) => setMeal(e.target.value)}>
                            {MEALS.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </label>
                </div>
                {error === "NO_DATE" && <p className={styles.error}>Please select a date</p>}

                <div className={styles.body}>
                    <div className={styles.searchColumn}>
                        <input
                            type="text"
                            className={styles.searchBar}
                            placeholder="Search foods to add…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            autoFocus
                        />
                        <div className={styles.searchResults}>
                            <SearchList
                                isAddable
                                onAdd={addToList}
                                input={input}
                            />
                        </div>
                    </div>

                    <div className={styles.selectedColumn}>
                        <h3 className={styles.selectedHeading}>
                            {meal} &middot; {list.size} {list.size === 1 ? 'item' : 'items'}
                        </h3>

                        {list.size > 0 ? (
                            <>
                                <div className={styles.selectedItems}>
                                    {Array.from(list.entries()).map(([name, { description, count }]) => (
                                        <div key={name} className={styles.selectedRow}>
                                            <ListItem name={name} description={description} count={count} />
                                            <div className={styles.stepper}>
                                                <button onClick={() => setCount(name, count - 1)} aria-label={`Remove one ${name}`}>−</button>
                                                <span>{count}</span>
                                                <button onClick={() => setCount(name, count + 1)} aria-label={`Add one ${name}`}>+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.totalCard}>
                                    <h4>Total</h4>
                                    <div className={styles.totalGrid}>
                                        <span>{Math.round(total.calories)} kcal</span>
                                        <span>{Math.round(total.fat)}g fat</span>
                                        <span>{Math.round(total.carbs)}g carbs</span>
                                        <span>{Math.round(total.protein)}g protein</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                <p>Search on the left and tap “Add” to build up this meal.</p>
                            </div>
                        )}

                        {error === "NO_ITEMS" && <p className={styles.error}>Add at least one food first</p>}
                        {error === "SAVE_FAILED" && <p className={styles.error}>Couldn't save — try again.</p>}

                        <button className={styles.saveButton} onClick={handleAdd} disabled={saving}>
                            {saving ? 'Saving…' : `Save ${meal.toLowerCase()}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
