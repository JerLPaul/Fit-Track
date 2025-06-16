import styles from "../styles/Days.module.css"
import Group from "../components/Group/Groups"
import SearchList from "../components/SearchList/SearchList"
import AddPopup from "../components/AddPopup/AddPopup"
import { useState } from "react";
import Layout from '../layouts/Default';


export default function Days() {
    const [isVisible, setIsVisible] = useState(false);
    
    const handleOpen = () => {
        setIsVisible(true);
    }

    const handleClose = () => {
        setIsVisible(false);
    }
    return(
        <div>
            <Layout>
                <div className={styles.mainContainer}>
                    {isVisible && (
                        <div className={styles.popupOverlay}>
                            <div className={styles.popupContent}>

                                <AddPopup onClose={handleClose} onAdd={() => console.log("Item added")} />
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