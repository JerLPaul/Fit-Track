import { useState } from 'react';
import styles from '../styles/Search.module.css';
import Layout from '../layouts/Default';
import SearchList from '../components/SearchList/SearchList';

export default function SearchPage() {
    const [input, setInput] = useState('');

    return (
        <Layout>
            <div className={styles.container}>
                <h1 className={styles.title}>Search foods</h1>
                <p className={styles.description}>
                    Look up nutrition facts for any food.
                </p>

                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        className={styles.searchBar}
                        placeholder='Search for a food, e.g. "banana"...'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                    />
                    <SearchList input={input} />
                </div>
            </div>
        </Layout>
    );
}
