import { useState } from 'react';
import styles from '../styles/Home.module.css';
import Layout from '../layouts/Default';
import SearchList from '../components/SearchList/SearchList';

export default function Home() {
  const [ input, setInput ] = useState('');

  const handleChange = (e) => {
    setInput(e.target.value);
  }

  return (
    <div>
    <Layout>
        <div className={styles.container}>
          <h1 className={styles.title}>
            Fit-Track
          </h1>

          <p className={styles.description}>
            Track your nutrition and fitness goals
          </p>

          <div>
            <input type="text" className={styles.searchBar} placeholder="Search..." value={input} onChange={handleChange}/>
            <SearchList input={input}/>
          </div>

          
        </div>
    </Layout>
    </div>
  );
}
