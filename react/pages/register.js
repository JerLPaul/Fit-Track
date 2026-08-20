import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Register and Login are now a single tabbed AuthForm at /login.
export default function RegisterRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/login');
    }, [router]);
    return null;
}
