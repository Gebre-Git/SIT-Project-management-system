import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    loginAsGuest: () => void;
    logout: () => Promise<void>;
    isGuest: boolean;
    isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true,
    loginAsGuest: () => { },
    logout: async () => { },
    isGuest: false,
    isSuperAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isGuest, setIsGuest] = useState(() => {
        return localStorage.getItem('isGuest') === 'true';
    });

    useEffect(() => {
        // If guest, don't listen to firebase
        if (isGuest) {
            setIsSuperAdmin(false);
            setLoading(false);
            return;
        }

        let adminUnsubscribe: (() => void) | null = null;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            // Cleanup previous admin listener if exists
            if (adminUnsubscribe) {
                adminUnsubscribe();
                adminUnsubscribe = null;
            }

            if (user) {
                // Listen for the super_admin status in Firestore (Spark-plan compatible)
                adminUnsubscribe = onSnapshot(doc(db, 'super_admins', user.uid), (doc) => {
                    setIsSuperAdmin(doc.exists());
                    setLoading(false);
                }, (error) => {
                    console.error('Error listening to super_admin doc:', error);
                    setIsSuperAdmin(false);
                    setLoading(false);
                });
            } else {
                setIsSuperAdmin(false);
                setLoading(false);
            }
        });

        return () => {
            unsubscribe();
            if (adminUnsubscribe) adminUnsubscribe();
        };
    }, [isGuest]);

    const loginAsGuest = () => {
        // Create a mock user object conforming to Firebase User interface (partially)
        const guestUser = {
            uid: 'guest-dev-user-123',
            displayName: 'Guest Developer',
            email: 'guest@bmanager.app',
            photoURL: null,
            emailVerified: true,
            isAnonymous: true,
            metadata: {},
            providerData: [],
            refreshToken: '',
            tenantId: null,
            delete: async () => { },
            getIdToken: async () => 'mock-token',
            getIdTokenResult: async () => ({
                token: 'mock-token',
                signInProvider: 'custom',
                claims: {},
                authTime: Date.now().toString(),
                issuedAtTime: Date.now().toString(),
                expirationTime: (Date.now() + 3600000).toString(),
            }),
            reload: async () => { },
            toJSON: () => ({}),
            phoneNumber: null,
            providerId: 'custom'
        } as unknown as User;

        setIsGuest(true);
        setIsSuperAdmin(false);
        localStorage.setItem('isGuest', 'true');
        setCurrentUser(guestUser);
    };

    const logout = async () => {
        if (isGuest) {
            setIsGuest(false);
            localStorage.removeItem('isGuest');
            setCurrentUser(null);
            setIsSuperAdmin(false);
        } else {
            await firebaseSignOut(auth);
        }
    };

    const value = {
        currentUser,
        loading,
        loginAsGuest,
        logout,
        isGuest,
        isSuperAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
