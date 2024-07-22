import styles from './LoginPopup.module.css'

export default function LoginPopup() {
    const handleSubmit = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
    }
    return (
        <div className={styles.container}>
            <h1>Login</h1>
            <form className={styles.container}>
                <label for="email">Email:</label>
                <input type="text" id="email" name="email" />
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}