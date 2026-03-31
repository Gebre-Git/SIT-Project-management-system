import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db, firebaseConfigError, isFirebaseAvailable } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, loading } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = React.useState(false);

    // If already authenticated, go straight to dashboard
    if (!loading && currentUser) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleGoogleLogin = async () => {
        if (isLoggingIn) return;

        if (!isFirebaseAvailable) {
            alert(`Firebase is not configured correctly. ${firebaseConfigError || 'Check your VITE_FIREBASE_* values.'}`);
            return;
        }

        setIsLoggingIn(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("Google Login Success:", user.uid);

            navigate('/dashboard');

            const userRef = doc(db, 'users', user.uid);
            getDoc(userRef).then(userSnap => {
                if (!userSnap.exists()) {
                    return setDoc(userRef, {
                        uid: user.uid,
                        displayName: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                }
            }).catch(error => console.warn("Firestore error:", error));

        } catch (error) {
            console.error("Login failed:", error);
            alert(`Login failed: ${(error as Error).message}`);
            setIsLoggingIn(false);
        }
    };


    return (
        <div className="min-h-screen flex bg-white dark:bg-sit-dark transition-colors duration-300">
            {/* Visual Side */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 bg-sit-dark overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sit-orange/10 blur-[120px] rounded-full mix-blend-screen -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sit-half-baked/10 blur-[100px] rounded-full mix-blend-screen -ml-20 -mb-20" />

                <div className="relative z-10 max-w-lg text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Empowering Your Innovation.</h2>
                    <p className="text-lg text-sit-light-blue leading-relaxed opacity-90">
                        The official project management system for the School of Information Technology. Streamline your workflow, collaborate with ease, and achieve excellence.
                    </p>
                </div>
            </div>

            {/* Login Form Side */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-slate-50 dark:bg-sit-dark">
                <div className="max-w-md w-full space-y-8 bg-white dark:bg-sit-dark/50 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-sit-half-baked/10 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-white/10 dark:bg-white/5 backdrop-blur-md p-4 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-inner group transition-all duration-500 hover:scale-105">
                            <img 
                                src="/src/assets/SIT SECONDARY LOGO PRIMARY COLOR.png" 
                                alt="SIT Logo" 
                                className="w-16 h-16 object-contain drop-shadow-2xl" 
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-sit-dark dark:text-white mb-2">SIT Manager</h1>
                        <p className="text-slate-500 dark:text-sit-half-baked/60 font-medium">Authentication Portal</p>
                    </div>

                    <div className="space-y-4 pt-4">
                        {!isFirebaseAvailable && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                                Firebase auth is unavailable. Add valid `VITE_FIREBASE_*` values to your local environment and restart Vite.
                            </div>
                        )}

                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoggingIn || !isFirebaseAvailable}
                            className={`w-full flex items-center justify-center gap-3 bg-white dark:bg-sit-dark text-sit-dark dark:text-white font-semibold py-4 px-6 rounded-2xl border-2 border-slate-100 dark:border-sit-half-baked/20 hover:border-sit-orange dark:hover:border-sit-orange hover:shadow-2xl hover:shadow-sit-orange/20 transition-all duration-500 group ${(isLoggingIn || !isFirebaseAvailable) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoggingIn ? (
                                <span className="animate-pulse">Signing in...</span>
                            ) : (
                                <>
                                    <div className="p-1 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                    </div>
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">Continue with Google</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex flex-col items-center gap-4 pt-6">
                        <p className="text-center text-xs text-slate-400 dark:text-sit-half-baked/40">
                            By continuing, you agree to the SIT Terms of Service and Privacy Policy.
                        </p>
                        <div className="h-px w-12 bg-slate-200 dark:bg-sit-half-baked/20" />
                        <span className="text-[10px] uppercase tracking-widest text-slate-300 dark:text-sit-half-baked/20 font-bold">
                            Official SIT Platform
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
