import styles from "./AddPopup.module.css";
import SearchList from "../SearchList/SearchList";
import ListItem from "../ListItem/ListItem";
import { useState } from "react";

export default function AddPopup({ onClose, onAdd }) {
    const [input, setInput] = useState('');
    const [dateInput, setDateInput] = useState('');
    const [error, setError] = useState(null);
    const [list, setList] = useState(new Map()); // Use Map for storing key-value pairs

    const handleChange = (e) => {
        setInput(e.target.value);
    };

    const handleDateChange = (e) => {
        setDateInput(e.target.value);
    }

    const handleAdd = () => {
        // Convert Map to an array for passing to onAdd
        if (!dateInput) {
            setError("NO_DATE");
            return;
        }

        const listArray = Array.from(list.entries()).map(([name, description]) => ({ name, description }));
        onAdd(dateInput, listArray);
        onClose();
    };

    const addToList = (name, description) => {
        setList((prevList) => {
            const newList = new Map(prevList);
    
            if (newList.has(name)) {
                // If the item already exists, increment the count
                const existingDescription = newList.get(name);
                existingDescription.count = (existingDescription.count || 1) + 1; // Increment count
                newList.set(name, existingDescription);
            } else {
                // Add a new item with count initialized to 1
                description.count = 1;
                newList.set(name, description);
            }
    
            return newList;
        });
    };

    const removeFromList = (name) => {
        setList((prevList) => {
            const newList = new Map(prevList);
            if (newList.get(name)?.count > 1) {
                // If the item count is greater than 1, decrement the count
                const existingDescription = newList.get(name);
                existingDescription.count -= 1;
                newList.set(name, existingDescription);
            }
            else {
                // If the item count is 1, remove it from the list
                newList.delete(name);
            }

            return newList;
        });
    };

    return (
        <div className={styles.popupOverlay}>
            <div className={styles.closeButtonContainer}>
                <button className={styles.closeButton} onClick={onClose}>
                    X
                </button>
            </div>
            <div className={styles.popupContent}>
                <div className={styles.addContainer}>
                    <div className={styles.dateRow}>
                        <label htmlFor="dateInput" className={styles.dateLabel}>Date:</label>
                        <input
                            type="date"
                            id="dateInput"
                            className={styles.dateInput}
                            value={dateInput}
                            onChange={handleDateChange}
                        />
                        {error === "NO_DATE" && <p className={styles.error}>Please select a date</p>}
                    </div>

                    <h2>Add New Item</h2>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            className={styles.searchBar}
                            placeholder="Search..."
                            value={input}
                            onChange={handleChange}
                        />
                        <SearchList
                            isAddable={true}
                            onAdd={(name, description) => addToList(name, description)}
                            input={input}
                        />
                    </div>
                    <button className={styles.addButton} onClick={handleAdd}>
                        Add
                    </button>
                </div>
                {list.size > 0 ? ( 
                    <div className={styles.selectedItemsSection}>
                        <h2>Selected Items</h2>
                        <div className={styles.selectedItemsContainer}>
                            {Array.from(list.entries()).map(([name, description], index) => (
                                <div key={index} className={styles.listItemContainer}>
                                    <button
                                        className={styles.removeButton}
                                        onClick={() => removeFromList(name)} // Remove item by name
                                    >
                                        X
                                    </button>
                                    <ListItem name={name} description={description} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={styles.noItemsContainer}>
                        <p>No items selected</p>
                    </div>
                )}
            </div>
            
        </div>
    );
}