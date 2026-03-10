import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        await signOut(auth);
    }

    return { user, loading, logout };
};


// This hook tracks Firebase auth state. 
// It returns the current user, a loading state, and a logout function.