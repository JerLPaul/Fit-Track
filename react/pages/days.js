import Layout from '../layouts/Default';
import styles from "../styles/Days.module.css"
import Group from "../components/Group/Groups"
import AddPopup from "../components/AddPopup/AddPopup"
import { useState } from "react";


export default function Days() {
    const [isVisible, setIsVisible] = useState(false);
    
    const handleOpen = () => {
        setIsVisible(true);
    }

    const handleClose = () => {
        setIsVisible(false);
    }

    const handleAdd = (list) => {
        // Logic to add a new item
        console.log("Added list:", list);

        // TODO - Add the list to Supabase db
    };
    return(
        <div>
            <Layout>
                <div className={styles.mainContainer}>
                    {isVisible && (
                        <div className={styles.popupOverlay}>
                            <div className={styles.popupContent}>

                                <AddPopup onClose={handleClose} onAdd={(list) => handleAdd(list)}/>
                            </div>
                        </div>
                    )}
                    <div className={styles.content}>

                    </div>
                    <div className={styles.buttonContainer}>
                        <button className={styles.addButton} onClick={handleOpen}>+</button>
                    </div>
                </div>
            </Layout>
        </div>
    )
}