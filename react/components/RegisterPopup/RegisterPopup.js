import styles from "./RegisterPopup.module.css";

export default function RegisterPopup() {
    return (
        <div className={styles.container}>
            <h2>Register</h2>
            <form className={styles.container}>
                <label for="email">Email:</label>
                <input type="text" id="email" name="email" />
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" />
                <label for="confirmPassword">Confirm Password:</label>
                <input type="password" id="confirmPassword" name="confirmPassword" />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
