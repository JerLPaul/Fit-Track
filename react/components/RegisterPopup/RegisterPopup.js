import styles from "./RegisterPopup.module.css";

export default function RegisterPopup() {
    return (
        <div className={styles.container}>
            <form className={styles.form}>
                <h1>Register</h1>
                <FormItem id="email" label="Email" type="text"/>
                <FormItem id="password" label="Password" type="password"/>
                <FormItem id="confirmPassword" label="Confirm Password" type="password"/>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

function FormItem(props) {
    return (
        <div className={styles.formItem}>
            <input type={props.type} id={props.id} name={props.id} placeholder={props.label}/>
        </div>
    );
}
