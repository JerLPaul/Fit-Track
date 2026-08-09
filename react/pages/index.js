import { useContext } from 'react';
import Link from 'next/link';
import Layout from '../layouts/Default';
import { UserContext } from '../utils/UserContext/UserContext';
import styles from '../styles/Home.module.css';

const FEATURES = [
    {
        title: 'Search any food',
        description: 'Look up calories, fat, carbs and protein for thousands of foods in seconds.',
        icon: '🔍',
    },
    {
        title: 'Log full meals at once',
        description: 'Build a meal from several foods, see the running totals, then save it in one go.',
        icon: '🍽️',
    },
    {
        title: 'See your history',
        description: 'Every day you log is saved to your account and updates live as you add to it.',
        icon: '📈',
    },
];

export default function Home() {
    const { user } = useContext(UserContext);

    return (
        <Layout>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <span className={styles.eyebrow}>Nutrition tracking, simplified</span>
                    <h1 className={styles.title}>Know exactly what you're eating.</h1>
                    <p className={styles.description}>
                        Fit-Track makes it easy to search foods, log full meals, and keep a running
                        history of your nutrition &mdash; without the clutter.
                    </p>
                    <div className={styles.heroActions}>
                        <Link href={user ? '/dashboard' : '/login'} className={styles.primaryButton}>
                            {user ? 'Go to dashboard' : 'Get started free'}
                        </Link>
                        <Link href="/search" className={styles.secondaryButton}>
                            Try the food search
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.features}>
                {FEATURES.map((feature) => (
                    <div key={feature.title} className={styles.featureCard}>
                        <span className={styles.featureIcon}>{feature.icon}</span>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                    </div>
                ))}
            </section>
        </Layout>
    );
}
