import { useState, useEffect } from 'react';
import style from './SearchList.module.css';

export default function SearchList(props) {

    const [suggestions, setSuggestions] = useState([]);

    const getSuggestions = async () => {
        try {
            const res = await fetch(`api/nutrition/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: props.input }),
            });
            const data = await res.json(); // Make sure to await the parsing of the JSON
            const items = data?.foods?.food?.map((item) => ({
                name: item.food_name,
                description: item.food_description,
                url: item.food_url
            })) ?? [];
            setSuggestions(items);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
                
    }

    useEffect(() => {
        getSuggestions();
    }, [props.input]);

    return (
        <div className={style.searchList}>
            {suggestions.map((item, index) => (
                <SearchItem key={index} name={item.name} description={item.description} ulr={item.url}/>
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
            <h3>{props.name}</h3>
            {selected ? <p className={style.description}>{props.description}</p> : null}
            
        </div>
    )
}
