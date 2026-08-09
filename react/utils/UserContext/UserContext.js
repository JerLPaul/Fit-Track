import { createContext, useState, useEffect } from 'react';
import { supabase } from '../SupabaseClient/SupabaseClient';

export const UserContext = createContext({
    user: null,
    loading: true,
    signInWithPassword: async () => {},
    signUpWithPassword: async () => {},
    signInWithGoogle: async () => {},
    signOut: async () => {},
});

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        // Check for an existing session when the app loads
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (isMounted) {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        };

        getSession();

        // Listen for auth state changes (covers SIGNED_IN, SIGNED_OUT,
        // TOKEN_REFRESHED, USER_UPDATED, etc. -- the previous version only
        // handled SIGNED_IN/SIGNED_OUT, which meant a page refresh could
        // silently leave the app thinking no one was logged in).
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signInWithPassword = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) setUser(data.user);
        return { error };
    };

    const signUpWithPassword = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (!error && data.user) setUser(data.user);
        return { error };
    };

    const signInWithGoogle = async () => {
        return supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, loading, signInWithPassword, signUpWithPassword, signInWithGoogle, signOut }}>
            {children}
        </UserContext.Provider>
    );
};
