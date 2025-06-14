import styles from "./styles/Days.module.css"
import Group from "../components/Group/Groups"
import SearchList from "../components/SearchList/SearchList"
import { useState } from "react";

export default function Days() {
    const [isVisible, setIsVisible] = useState(false);
    
    const handleOpen = () => {
        setIsVisible(true);
    }

    const handleClose = () => {
        setIsVisible(false);
    }
    return(
        <div className={styles.mainContainer}>
            {isVisible && (
                <div className={styles.popupOverlay}>
                    <Group onClose={handleClose} onAdd={() => console.log("Item added")} />
                </div>
            )}
            <div className={styles.content}>

            </div>
            <div className={styles.addButton}>
                <button onClick={handleOpen}>+</button>
            </div>
        </div>
    )
}