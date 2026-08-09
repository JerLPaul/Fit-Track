import styles from './ListItem.module.css';

export default function ListItem({ name, description, count = 1 }) {
    const { serving, macros } = description;

    return (
        <div className={styles.listItem}>
            <div className={styles.listItemHeader}>
                <h4>{name}</h4>
                {count > 1 && <span className={styles.countBadge}>×{count}</span>}
            </div>
            {serving && <p className={styles.serving}>{serving}</p>}
            <div className={styles.macroRow}>
                <span>{macros.calories * count} kcal</span>
                <span>{macros.fat * count}g fat</span>
                <span>{macros.carbs * count}g carbs</span>
                <span>{macros.protein * count}g protein</span>
            </div>
        </div>
    );
}
