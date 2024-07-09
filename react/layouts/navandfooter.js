import styles from "../styles/nav.module.css"
import Head from 'next/head'
import Image from 'next/image'

export default function NavAndFooter({ children }) {
  return (
    <div>
        <Head>
            <title>Fit-Track</title>
            <link rel="icon" href="/logo.ico" />
        </Head>

        <main>
            <nav className={styles.navbar}>
                <ul className={styles.navlist}>
                    <li className={styles.navitem}> <a href="/"> <Image src="/logo.svg" alt="Fit-Track Logo" width={40} height={30}/> </a></li>
                    <li className={styles.navitem}> <a href="/">Fit-Track</a></li>
                    <li className={styles.navitem}> <a href="/">Home</a></li>
                    <li className={styles.navitem}> <a href="/">About</a></li>
                    <li className={styles.navitem}> <a href="/">Login</a></li>
                    <li className={styles.navitem}> </li>
                    
                </ul>
            </nav>
            {children}
            <footer className={styles.footer}>
                <p>This is a test</p>
            </footer>
        </main>
    </div>
  )
}