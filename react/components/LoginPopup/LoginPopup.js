import styles from './LoginPopup.module.css'

export default function LoginPopup() {
    const handleSubmit = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
    }
    return (
        <div className={styles.container}>
            <form className={styles.form}>
                <h1>Login</h1>
                <FormItem id="email" label="Email" type="text"/>
                <FormItem id="password" label="Password" type="password"/>
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

function FormItem(props) {
    return (
        <div className={styles.formItem}>
            <input type={props.type} id={props.id} name={props.id} placeholder={props.label}/>
        </div>
    )
}