import styles from './LoginPopup.module.css'

export default function LoginPopup() {

    const login = async (email, password) => {
        try {
            const res = await fetch('api/users/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),

            });

            const data = await res.json();
            console.log(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

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
                <button type="submit" onClick={handleSubmit}>Login</button>
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