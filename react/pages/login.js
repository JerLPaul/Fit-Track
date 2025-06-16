import Layout from '../layouts/Default';
import LoginPopup from "../components/LoginPopup/LoginPopup";
import styles from '../styles/Login.module.css';

export default function LoginPage() {
    return (
        <div>
            <Layout>
                <div className={styles.container}>
                    <LoginPopup />
                </div>
            </Layout>
        </div>
    );
}