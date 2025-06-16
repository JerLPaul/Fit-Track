import styles from "../styles/Dashboard.module.css"
import Link from "next/link";
import Layout from '../layouts/Default';


export default function Dashboard() {


    return (
    <>
        <Layout>
        <div className={styles.mainContainer}>
            <div class={styles.option}>
                <h2> Search </h2>
                <Link href="/">
                    <button class={styles.goButton}>Go</button>
                </Link>       
            </div>
            <div className={styles.option}>
                <h2> Add/View Days </h2>
                <Link href="/days">
                    <button class={styles.goButton}>Go</button>
                </Link>
            </div>
        </div>
        </Layout>
    </>
    );
}