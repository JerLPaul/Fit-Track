import styles from "./AddPopup.module.css";
import SearchList from "../components/SearchList/SearchList"
import { useState } from "react";

export default function AddPopup({ onClose, onAdd }) {
    const [ input, setInput ] = useState('');

    const handleChange = (e) => {
        setInput(e.target.value);
    }
    
    const handleAdd = () => {
        // Logic to add a new item
        onAdd();
        onClose();
    };
    

    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
                <h2>Add New Item</h2>
                <div className={styles.searchContainer}>
                    <input type="text" className={styles.searchBar} placeholder="Search..." value={input} onChange={handleChange}/>
                    <SearchList input={input}/>
                </div>
                <button className={styles.addButton} onClick={handleAdd}>Add</button>
                <button className={styles.closeButton} onClick={onClose}>Close</button>
            </div>
        </div>
    );
}