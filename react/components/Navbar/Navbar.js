import { useState } from 'react';
import styles from './Navbar.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className={styles.navbar}>
            {/* Logo on the left */}
            <div className={styles.logo}>
                <Link href="/">
                    <Image src="/logo.svg" alt="Fit-Track Logo" width={40} height={30} />
                </Link>
            </div>

            {/* Navigation Links */}
            <ul className={`${styles.navlist} ${menuOpen ? styles.active : ''}`}>
                <li className={styles.navitem}>
                    <Link href="/plan">Plan</Link>
                </li>
                
                <li className={styles.navitem}>
                    <Link href="/register">Register</Link>
                </li>
                <li className={styles.navitem}>
                    <Link href="/login">Login</Link>
                </li>
            </ul>

            {/* Hamburger Icon on the right */}
            <div className={styles.hamburger} onClick={toggleMenu}>
                ☰
            </div>
        </nav>
    );
}