import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './AuthForm.module.css';
import { UserContext } from '../../utils/UserContext/UserContext';

export default function AuthForm() {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { signInWithPassword, signUpWithPassword, signInWithGoogle } = useContext(UserContext);
    const router = useRouter();

    const resetMessages = () => {
        setError(null);
        setInfo(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        resetMessages();

        if (mode === 'register' && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setSubmitting(true);
        const { error } = mode === 'login'
            ? await signInWithPassword(email, password)
            : await signUpWithPassword(email, password);
        setSubmitting(false);

        if (error) {
            setError(error.message);
            return;
        }

        if (mode === 'register') {
            setInfo('Account created! Check your email to confirm, then sign in.');
            setMode('login');
        } else {
            router.push('/dashboard');
        }
    };

    const handleGoogleAuth = async () => {
        resetMessages();
        const { error } = await signInWithGoogle();
        if (error) setError(error.message);
    };

    return (
        <div className={styles.card}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
                    onClick={() => { setMode('login'); resetMessages(); }}
                    type="button"
                >
                    Sign in
                </button>
                <button
                    className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
                    onClick={() => { setMode('register'); resetMessages(); }}
                    type="button"
                >
                    Create account
                </button>
            </div>

            <h1 className={styles.heading}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
            <p className={styles.subheading}>
                {mode === 'login' ? 'Sign in to get back to your log.' : 'Start tracking in under a minute.'}
            </p>

            <button className={styles.googleButton} onClick={handleGoogleAuth} type="button">
                <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                Continue with Google
            </button>

            <div className={styles.divider}>
                <span>or</span>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.field}>
                    <span>Email</span>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                    />
                </label>
                <label className={styles.field}>
                    <span>Password</span>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                </label>
                {mode === 'register' && (
                    <label className={styles.field}>
                        <span>Confirm password</span>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </label>
                )}

                {error && <p className={styles.error}>{error}</p>}
                {info && <p className={styles.info}>{info}</p>}

                <button type="submit" className={styles.submitButton} disabled={submitting}>
                    {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
                </button>
            </form>
        </div>
    );
}
