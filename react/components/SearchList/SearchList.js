import { useState, useEffect, useRef } from 'react';
import style from './SearchList.module.css';

// Parses a FatSecret "food_description" string like:
// "Per 100g - Calories: 52kcal | Fat: 0.17g | Carbs: 13.81g | Protein: 0.26g"
// into a labelled object. The previous implementation assumed calories/fat/
// carbs/protein always sat at fixed array indices [1]-[4], which broke (or
// silently mislabeled macros) whenever a food's description omitted a field
// or listed them in a different order.
function parseDescription(raw) {
    const parts = raw.split(/ - | \| /).map((p) => p.trim()).filter(Boolean);
    const serving = parts[0] || '';
    const macros = { calories: 0, fat: 0, carbs: 0, protein: 0 };

    parts.slice(1).forEach((part) => {
        const match = part.match(/^(\w+):\s*([\d.]+)/);
        if (!match) return;
        const [, label, value] = match;
        const key = label.toLowerCase();
        if (key in macros) macros[key] = parseFloat(value);
    });

    return { raw, parts, serving, macros };
}

export default function SearchList({ input, isAddable, onAdd }) {
    const [suggestions, setSuggestions] = useState([]);
    const [status, setStatus] = useState('idle'); // idle | loading | error
    const debounceRef = useRef(null);
    const requestIdRef = useRef(0);

    useEffect(() => {
        clearTimeout(debounceRef.current);

        const query = input.trim();
        if (!query) {
            setSuggestions([]);
            setStatus('idle');
            return;
        }

        // Bug fix: previously every keystroke fired an immediate network
        // request with no debounce, hammering the nutrition API and
        // frequently rendering results out of order as responses raced.
        debounceRef.current = setTimeout(async () => {
            const requestId = ++requestIdRef.current;
            setStatus('loading');
            try {
                const res = await fetch('/api/nutrition', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: query }),
                });
                const data = await res.json();

                // Ignore stale responses that resolve out of order.
                if (requestId !== requestIdRef.current) return;

                const rawFoods = data?.foods?.food ?? [];
                const items = rawFoods.map((item) => ({
                    name: item.food_name,
                    description: parseDescription(item.food_description || ''),
                    url: item.food_url,
                }));
                setSuggestions(items);
                setStatus('idle');
            } catch (error) {
                if (requestId !== requestIdRef.current) return;
                console.error('Error fetching nutrition data:', error);
                setSuggestions([]);
                setStatus('error');
            }
        }, 350);

        return () => clearTimeout(debounceRef.current);
    }, [input]);

    if (status === 'idle' && !input.trim()) {
        return null;
    }

    return (
        <div className={style.searchList}>
            {status === 'loading' && <p className={style.status}>Searching…</p>}
            {status === 'error' && <p className={style.statusError}>Couldn't load results. Try again.</p>}
            {status === 'idle' && input.trim() && suggestions.length === 0 && (
                <p className={style.status}>No foods found for "{input.trim()}".</p>
            )}
            {suggestions.map((item, index) => (
                <SearchItem
                    key={`${item.name}-${index}`}
                    name={item.name}
                    description={item.description}
                    url={item.url}
                    isAddable={isAddable}
                    onAdd={onAdd}
                />
            ))}
        </div>
    );
}

function SearchItem({ name, description, isAddable = false, onAdd }) {
    const [selected, setSelected] = useState(false);
    const { serving, parts, macros } = description;

    return (
        <div className={style.searchItem} onClick={() => setSelected((v) => !v)}>
            <div className={style.infoContainer}>
                <div className={style.itemHeader}>
                    <h3>{name}</h3>
                    {serving && <span className={style.serving}>{serving}</span>}
                </div>

                <div className={style.macroRow}>
                    <span className={style.macroPill}>{macros.calories} kcal</span>
                    <span className={style.macroPill}>{macros.fat}g fat</span>
                    <span className={style.macroPill}>{macros.carbs}g carbs</span>
                    <span className={style.macroPill}>{macros.protein}g protein</span>
                </div>

                {selected && (
                    <div className={style.stats}>
                        {parts.slice(1).map((item, index) => (
                            <p key={index}>{item}</p>
                        ))}
                    </div>
                )}
            </div>

            {isAddable && (
                <button
                    className={style.addButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd(name, description);
                    }}
                >
                    Add
                </button>
            )}
        </div>
    );
}
