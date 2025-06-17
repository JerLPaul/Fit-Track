import styles from "./AddPopup.module.css";
import SearchList from "../SearchList/SearchList";
import ListItem from "../ListItem/ListItem";
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

    const addToList = (name, description) => {
        list.push(
            <div className={styles.listItemContainer}>
                <button className={styles.removeButton} onClick={() => {
                    list = list.filter(item => item.props.name !== name);
                    setInput('');
                }}>X</button>
                <ListItem name={name} description={description} key={name}/>
            </div>
        );
    }

    

    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
                <div className={styles.closeButtonContainer}>
                    <button className={styles.closeButton} onClick={onClose}>X</button>
                </div>

                {list.length > 0 (
                    <div className={styles.selectedItemsContainer}>
                        <h2>Selected Items</h2>
                        {list.map((item, index) => (
                            <div key={index} className={styles.selectedItem}>
                                {item}
                            </div>
                        ))}
                    </div>
                )}
                <h2>Add New Item</h2>
                <div className={styles.searchContainer}>
                    <input type="text" className={styles.searchBar} placeholder="Search..." value={input} onChange={handleChange}/>
                    <SearchList isAddable={true} onAdd={(name, description) => addToList(name, description)} input={input}/>
                </div>
            </div>
            <button className={styles.addButton} onClick={() => handleAdd()}>Add</button>
        </div>
    );
}
