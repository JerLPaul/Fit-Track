import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../layouts/Default';
import AuthForm from '../components/AuthForm/AuthForm';
import { UserContext } from '../utils/UserContext/UserContext';
import styles from '../styles/Login.module.css';

export default function LoginPage() {
    const { user, loading } = useContext(UserContext);
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/dashboard');
        }
    }, [loading, user, router]);

    return (
        <Layout>
            <div className={styles.container}>
                <AuthForm />
            </div>
        </Layout>
    );
}
