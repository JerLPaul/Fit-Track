import { useState, useEffect } from 'react';
import style from './SearchList.module.css';

export default function SearchList(props) {

    const [suggestions, setSuggestions] = useState([]);

    const getSuggestions = async () => {
        try {
            const response = await fetch(`https://fit-track-backend.onrender.com/nutrition/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: props.input,
                    }),
                }
            );
            
            if (!response.ok) {
                throw new Error(response.statusText || "An error occurred while fetching the data.");
            }

            const data = await response.json();
                
            const items = data.foods.food.map((item) => ({
                name: item.food_name,
                description: item.food_description,
            }));
            setSuggestions(items);
                
        } catch (error) {
            console.error('Failed to fetch data: ', error);
            return [];
        }
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
