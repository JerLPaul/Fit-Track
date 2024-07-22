import Layout from '../layouts/Default';
import Register from '../components/RegisterPopup/RegisterPopup';

import styles from '../styles/Home.module.css';

export default function RegisterPage() {
    return (
        <div>
            <Layout>
                <div className={styles.container}>
                    <Register />
                </div>
            </Layout>
        </div>
    );
}