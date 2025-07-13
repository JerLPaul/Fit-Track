import styles from './ListItem.module.css';
import { useState } from 'react';

export default function ListItem( { name, description} ) {
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        isHovered ? setIsHovered(false) : setIsHovered(true);
    };

    return (
        <div className={styles.listItem} onClick={handleClick}>
            <h4>{name}</h4>
            {isHovered ? 
                description.map((item, index) => (
                    <p key={index}>{item}</p>
                ))
            : 
                <p className={styles.description}>{description[0]}</p>
            }
            <p>Count: {description.count || 1}</p>
        </div>
    );
} 