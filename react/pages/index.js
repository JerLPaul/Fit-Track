import styles from '../styles/Home.module.css';
import Layout from '../layouts/navandfooter';

export default function Home() {
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

          <input type="text" className={styles.searchBar} placeholder="Search..." />
          
        </div>
    </Layout>
    </div>
  );
}
