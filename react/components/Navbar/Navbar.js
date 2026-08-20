import { useContext, useState, useRef, useEffect } from 'react';
import styles from './Navbar.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { UserContext } from '../../utils/UserContext/UserContext';

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, signOut } = useContext(UserContext);
    const router = useRouter();
    const menuRef = useRef(null);

    // Close the account dropdown on outside click / Escape -- the old
    // hamburger menu had no such handling and no proper account menu at all.
    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        const close = () => setMobileOpen(false);
        router.events.on('routeChangeStart', close);
        return () => router.events.off('routeChangeStart', close);
    }, [router.events]);

    const handleSignOut = async () => {
        setMenuOpen(false);
        await signOut();
        router.push('/');
    };

    const initial = (user?.email || '?').charAt(0).toUpperCase();

    const links = user
        ? [
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/days', label: 'Diary' },
              { href: '/progress', label: 'Progress' },
              { href: '/search', label: 'Search Foods' },
          ]
        : [
              { href: '/search', label: 'Search Foods' },
          ];

    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.logo}>
                <Image src="/logo.svg" alt="Fit-Track" width={32} height={24} priority />
                <span className={styles.wordmark}>Fit-Track</span>
            </Link>

            <ul className={styles.navlist}>
                {links.map((link) => (
                    <li key={link.href} className={styles.navitem}>
                        <Link
                            href={link.href}
                            className={router.pathname === link.href ? styles.navitemActive : undefined}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className={styles.navRight}>
                {user ? (
                    <div className={styles.accountMenu} ref={menuRef}>
                        <button
                            className={styles.avatarButton}
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                        >
                            <span className={styles.avatar}>{initial}</span>
                            <svg
                                className={`${styles.chevron} ${menuOpen ? styles.chevronOpen : ''}`}
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {menuOpen && (
                            <div className={styles.dropdown} role="menu">
                                <div className={styles.dropdownHeader}>
                                    <span className={styles.dropdownEmail}>{user.email}</span>
                                </div>
                                <div className={styles.dropdownDivider} />
                                <Link href="/dashboard" className={styles.dropdownItem} role="menuitem" onClick={() => setMenuOpen(false)}>
                                    Dashboard
                                </Link>
                                <Link href="/days" className={styles.dropdownItem} role="menuitem" onClick={() => setMenuOpen(false)}>
                                    Diary
                                </Link>
                                <Link href="/progress" className={styles.dropdownItem} role="menuitem" onClick={() => setMenuOpen(false)}>
                                    Progress
                                </Link>
                                <div className={styles.dropdownDivider} />
                                <button className={styles.dropdownItemDanger} role="menuitem" onClick={handleSignOut}>
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href="/login" className={styles.signInButton}>
                        Sign in
                    </Link>
                )}

                <button
                    className={styles.hamburger}
                    onClick={() => setMobileOpen((v) => !v)}
                    aria-label="Toggle menu"
                    aria-expanded={mobileOpen}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>

            {mobileOpen && (
                <div className={styles.mobilePanel}>
                    {links.map((link) => (
                        <Link key={link.href} href={link.href} className={styles.mobileItem}>
                            {link.label}
                        </Link>
                    ))}
                    {user ? (
                        <button className={styles.mobileItemDanger} onClick={handleSignOut}>
                            Sign out
                        </button>
                    ) : (
                        <Link href="/login" className={styles.mobileItem}>
                            Sign in
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
