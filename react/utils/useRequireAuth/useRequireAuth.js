import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserContext } from '../UserContext/UserContext';

// Redirects to /login if there's no signed-in user once the auth state has
// finished loading. Returns { user, loading } so pages can render a loading
// state instead of flashing protected content (or a redirect) before the
// session check resolves.
export default function useRequireAuth() {
    const { user, loading } = useContext(UserContext);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [loading, user, router]);

    return { user, loading };
}
