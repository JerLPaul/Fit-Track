import styles from "../styles/nav.module.css"
import Head from 'next/head'

export default function NavAndFooter({ children }) {
  return (
    <div>
        <Head>
            <title>My Site</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
            <nav className={styles.navbar}>
                <ul className={styles.navlist}>
                    <li className={styles.navitem}> <a href="/">Home</a></li>
                    <li className={styles.navitem}> <a href="/">About</a></li>
                    <li className={styles.navitem}> <a href="/">Login</a></li>
                    
                </ul>
            </nav>
            {children}
            <footer>
                <p>Footer</p>
            </footer>
        </main>
    </div>
  )
}