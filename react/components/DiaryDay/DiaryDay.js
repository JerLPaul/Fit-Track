import styles from './DiaryDay.module.css';

const MEAL_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function DiaryDay({ entries, loading, onDelete }) {
    if (loading) {
        return <p className={styles.status}>Loading…</p>;
    }

    if (entries.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>Nothing logged for this day yet.</p>
            </div>
        );
    }

    const totals = entries.reduce(
        (acc, e) => {
            acc.calories += e.calories * e.count;
            acc.fat += e.fat * e.count;
            acc.carbs += e.carbs * e.count;
            acc.protein += e.protein * e.count;
            return acc;
        },
        { calories: 0, fat: 0, carbs: 0, protein: 0 }
    );

    const byMeal = entries.reduce((acc, e) => {
        const meal = e.meal || 'Snack';
        (acc[meal] = acc[meal] || []).push(e);
        return acc;
    }, {});

    const mealNames = [
        ...MEAL_ORDER.filter((m) => byMeal[m]),
        ...Object.keys(byMeal).filter((m) => !MEAL_ORDER.includes(m)),
    ];

    return (
        <div>
            <div className={styles.totalsBar}>
                <div className={styles.totalStat}>
                    <span className={styles.totalValue}>{Math.round(totals.calories)}</span>
                    <span className={styles.totalLabel}>kcal</span>
                </div>
                <div className={styles.totalStat}>
                    <span className={styles.totalValue}>{Math.round(totals.fat)}g</span>
                    <span className={styles.totalLabel}>fat</span>
                </div>
                <div className={styles.totalStat}>
                    <span className={styles.totalValue}>{Math.round(totals.carbs)}g</span>
                    <span className={styles.totalLabel}>carbs</span>
                </div>
                <div className={styles.totalStat}>
                    <span className={styles.totalValue}>{Math.round(totals.protein)}g</span>
                    <span className={styles.totalLabel}>protein</span>
                </div>
            </div>

            {mealNames.map((meal) => (
                <div key={meal} className={styles.mealBlock}>
                    <h3 className={styles.mealHeading}>{meal}</h3>
                    <ul className={styles.foodList}>
                        {byMeal[meal].map((entry) => (
                            <li key={entry.id} className={styles.foodRow}>
                                <div>
                                    <span className={styles.foodName}>
                                        {entry.name}{entry.count > 1 ? ` ×${entry.count}` : ''}
                                    </span>
                                    {entry.serving && <span className={styles.foodServing}>{entry.serving}</span>}
                                </div>
                                <div className={styles.foodRight}>
                                    <span className={styles.foodCalories}>
                                        {Math.round(entry.calories * entry.count)} kcal
                                    </span>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => onDelete(entry.id)}
                                        aria-label={`Remove ${entry.name}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
