import { useState, useEffect } from 'react';
import style from './SearchList.module.css';

export default function SearchList(props) {

    const [suggestions, setSuggestions] = useState([]);

    const getSuggestions = async () => {
        const res = await fetch(`http://127.0.0.1:5000/nutrition/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: props.input }),
        }).then((res) => {
            res.json();
        }).then((data) => {
            const items = data?.foods?.food?.map((item) => ({
                name: item.food_name,
                description: item.food_description,
            })) ?? [];
            setSuggestions(items);            
        })
                
    }

    useEffect(() => {
        getSuggestions();
    }, [props.input]);

    return (
        <div className={style.searchList}>
            {suggestions.map((item, index) => (
                <SearchItem key={index} name={item.name} description={item.description} />
            ))}
        </div>
    );
    
}

function SearchItem(props) {
    const [selected, setSelected] = useState(false);

    const handleClick = () => {
        setSelected(!selected);
    }

    return (
        <div className={style.searchItem} onClick={handleClick}>
            <p>{props.name}</p>

            {selected ? <p className={style.description}>{props.description}</p> : null}
            
        </div>
    )
}
