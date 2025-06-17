import styles from './ListItem.module.css';

export default function ListItem( { name, description} ) {
    return (
        <div className={styles.listItem}>
            <h3>{name}</h3>
            <p>{description}</p>
        </div>
    );
} 