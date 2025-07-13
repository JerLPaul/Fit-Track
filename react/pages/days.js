import Layout from '../layouts/Default';
import styles from "../styles/Days.module.css"
import Groups from "../components/Groups/Groups"
import AddPopup from "../components/AddPopup/AddPopup"
import { useState } from "react";
import { supabase } from "../utils/SupabaseClient/SupabaseClient";


export default function Days() {
    const [isVisible, setIsVisible] = useState(false);
    
    const handleOpen = () => {
        setIsVisible(true);
    }

    const handleClose = () => {
        setIsVisible(false);
    }

    const handleAdd = async (date, list) => {
        try {
            // Convert the list to JSON format
            const listJSON = JSON.stringify(list);
    
            // Insert the data into the "Day" table
            const { data, error } = await supabase
                .from("Day")
                .insert([
                    {
                        date: date, // Store the date
                        food_list: listJSON, // Store the list as JSON
                    },
                ]);
    
            if (error) {
                console.error("Error inserting data into Supabase:", error.message);
            } else {
                console.log("Data successfully added to Supabase:", data);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
        }
    };
    return(
        <div>
            <Layout>
                <div className={styles.mainContainer}>
                    {isVisible && (
                        <div className={styles.popupOverlay}>
                            <AddPopup onClose={handleClose} onAdd={(date, list) => handleAdd(date, list)}/>
                        </div>
                    )}
                    <div className={styles.content}>
                        <Groups />
                    </div>
                    <div className={styles.buttonContainer}>
                        <button className={styles.addButton} onClick={handleOpen}>+</button>
                    </div>
                </div>
            </Layout>
        </div>
    )
}