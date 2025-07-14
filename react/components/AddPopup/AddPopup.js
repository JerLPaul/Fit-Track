import styles from "./AddPopup.module.css";
import SearchList from "../SearchList/SearchList";
import ListItem from "../ListItem/ListItem";
import { useState } from "react";

export default function AddPopup({ onClose, onAdd }) {
    const [input, setInput] = useState('');
    const [dateInput, setDateInput] = useState('');
    const [total, setTotal] = useState([0,0,0,0]);
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
        onAdd(dateInput, listArray, total);
        onClose();
    };

    const addToList = (name, description) => {
        console.log("Adding to list:", name, description);
        setList((prevList) => {
            const newList = new Map(prevList);

            const newTotal = total;
            newTotal[0] += description[1].match(/\d+/g) ? parseInt(description[1].match(/\d+/g)[0]) : 0; // Calories
            newTotal[1] += description[2].match(/\d+/g) ? parseInt(description[2].match(/\d+/g)[0]) : 0; // Fat
            newTotal[2] += description[3].match(/\d+/g) ? parseInt(description[3].match(/\d+/g)[0]) : 0; // Carbs
            newTotal[3] += description[4].match(/\d+/g) ? parseInt(description[4].match(/\d+/g)[0]) : 0; // Protein
            setTotal(newTotal);

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

            const newTotal = total.slice(); // Create a copy of the total array
            const itemDescription = newList.get(name);
            if (itemDescription) {
                newTotal[0] -= itemDescription[1].match(/\d+/g) ? parseInt(itemDescription[1].match(/\d+/g)[0]) : 0; // Calories
                newTotal[1] -= itemDescription[2].match(/\d+/g) ? parseInt(itemDescription[2].match(/\d+/g)[0]) : 0; // Fat
                newTotal[2] -= itemDescription[3].match(/\d+/g) ? parseInt(itemDescription[3].match(/\d+/g)[0]) : 0; // Carbs
                newTotal[3] -= itemDescription[4].match(/\d+/g) ? parseInt(itemDescription[4].match(/\d+/g)[0]) : 0; // Protein
                setTotal(newTotal);
            }

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
                        <div className={styles.totalContainer}>
                            <h3>Total:</h3>
                            <p>Calories: {total[0]}</p>
                            <p>Fat: {total[1]}g</p>
                            <p>Carbs: {total[2]}g</p>
                            <p>Protein: {total[3]}g</p>
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