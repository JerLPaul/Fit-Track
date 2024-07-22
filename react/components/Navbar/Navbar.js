import styles from './Navbar.module.css'
import Image from 'next/image'
import Link from 'next/link' // Import Link from next/link

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <ul className={styles.navlist}>
                <li className={styles.navitem}>
                    <Link href="/">
                        <Image src="/logo.svg" alt="Fit-Track Logo" width={40} height={30}/>
                    </Link>
                </li>
                <li className={styles.navitem}>
                    <Link href="/">Home</Link>
                </li>
                <li className={styles.navitem}>
                    <Link href="/register">Register</Link> 
                </li>
                <li className={styles.navitem}>
                    <Link href="/login">Login</Link>
                </li>
            </ul>
        </nav>
    )
}