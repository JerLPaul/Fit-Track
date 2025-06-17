import styles from "./AddPopup.module.css";
import SearchList from "../SearchList/SearchList";
import { useState } from "react";

export default function AddPopup({ onClose, onAdd }) {
    const [ input, setInput ] = useState('');
    
    var list = [];

    const handleChange = (e) => {
        setInput(e.target.value);
    }
    
    const handleAdd = () => {
        // Logic to add a new item
        onAdd(list);
        onClose();
    };

    const addToList = (description) => {
        list.push(description);
    }

    

    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
                <div className={styles.closeButtonContainer}>
                    <button className={styles.closeButton} onClick={onClose}>X</button>
                </div>
                <h2>Add New Item</h2>
                <div className={styles.searchContainer}>
                    <input type="text" className={styles.searchBar} placeholder="Search..." value={input} onChange={handleChange}/>
                    <SearchList isAddable={true} onAdd={(description) => addToList(description)} input={input}/>
                </div>
            </div>
            <button className={styles.addButton} onClick={() => handleAdd()}>Add</button>
        </div>
    );
}