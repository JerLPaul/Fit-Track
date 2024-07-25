import { useState, useEffect } from 'react';
import { PieChart } from 'react-minimal-pie-chart';

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
            const data = await res.json();
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

    const data = props.description.match(/: \d+(\.\d+)?g/g);
    const pieValues = data.map((item) => parseFloat(item.slice(2, -1)));


    return (
        <div className={style.searchItem} onClick={handleClick}>
            <h3>{props.name}</h3>
            {selected ? <p className={style.description}>{props.description}</p> : null }
            {
                selected ? 
                <div className={style.chart}>
                    <PieChart
                        data={[
                            { title: 'Protein', value: pieValues[2], color: '#E38627' },
                            { title: 'Carbs', value: pieValues[1], color: '#C13C37' },
                            { title: 'Fat', value: pieValues[0], color: '#6A2135' },
                            
                        ]}
                    />
                </div>
                 : null
            }
            
        </div>
    )
}
