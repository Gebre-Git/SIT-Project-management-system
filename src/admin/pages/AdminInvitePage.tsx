import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Shield, Loader2, CheckCircle, XCircle, LogIn } from 'lucide-react';

type ClaimStatus = 'idle' | 'waiting-auth' | 'claiming' | 'success' | 'error';

const AdminInvitePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<ClaimStatus>('idle');
    const [message, setMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Listen for auth state
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return unsub;
    }, []);

    // Auto-claim when user is logged in and token is present
    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No invitation token found in the URL.');
            return;
        }

        if (!currentUser) {
            setStatus('waiting-auth');
            setMessage('Please log in to claim your admin invitation.');
            // Store token for after login
            localStorage.setItem('pendingAdminToken', token);
            return;
        }

        // User is logged in, attempt to claim
        claimInvite(token);
    }, [currentUser, token]);

    const claimInvite = async (tok: string) => {
        setStatus('claiming');
        setMessage('Verifying and claiming your admin invitation...');

        try {
            const tokenRef = doc(db, 'adminInvitationTokens', tok);
            const tokenSnap = await getDoc(tokenRef);

            if (!tokenSnap.exists()) {
                throw new Error('Invalid invitation token.');
            }

            const tokenData = tokenSnap.data();
            const userEmail = currentUser?.email?.toLowerCase().trim();

            // Validation logic mirrored from security rules for better UX
            if (tokenData.used) {
                throw new Error('This invitation has already been used.');
            }

            const now = Date.now();
            if (now > tokenData.expiresAt.toMillis()) {
                throw new Error('This invitation has expired.');
            }

            if (tokenData.email !== userEmail) {
                throw new Error(`This invitation was sent to ${tokenData.email}, but you are logged in as ${userEmail}.`);
            }

            // Perform promotion and token update in a batch
            const batch = writeBatch(db);
            
            // 1. Create the super_admin record
            batch.set(doc(db, 'super_admins', currentUser!.uid), {
                uid: currentUser!.uid,
                email: userEmail,
                promotedAt: serverTimestamp(),
                claimedWithToken: tok
            });

            // 2. Mark token as used
            batch.update(tokenRef, {
                used: true,
                usedByUid: currentUser!.uid,
                usedAt: serverTimestamp()
            });

            await batch.commit();

            localStorage.removeItem('pendingAdminToken');
            setStatus('success');
            setMessage('Congratulations! You are now a super-admin.');

            // Redirect to admin after a moment
            setTimeout(() => navigate('/admin'), 2500);
        } catch (err: any) {
            console.error('Claim invite error:', err);
            setStatus('error');
            setMessage(err.message || 'Failed to claim admin invitation.');
        }
    };

    const statusConfig = {
        'idle': { icon: Shield, color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
        'waiting-auth': { icon: LogIn, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        'claiming': { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        'success': { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        'error': { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <div className="glass-card rounded-3xl p-8 text-center shadow-xl">
                    {/* Logo area */}
                    <div className="mb-6">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 flex items-center justify-center shadow-xl shadow-blue-500/30 mb-4">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Invitation</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">CrewSpace Super-Admin Access</p>
                    </div>

                    {/* Status indicator */}
                    <div className={`p-5 rounded-2xl ${config.bg} mb-6`}>
                        <StatusIcon className={`w-10 h-10 mx-auto mb-3 ${config.color} ${status === 'claiming' ? 'animate-spin' : ''}`} />
                        <p className={`text-sm font-medium ${config.color}`}>{message}</p>
                    </div>

                    {/* Actions */}
                    {status === 'waiting-auth' && (
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                        >
                            <LogIn className="w-4 h-4" />
                            Log In to Continue
                        </Link>
                    )}

                    {status === 'success' && (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Redirecting to admin dashboard...</p>
                            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2.5, ease: 'linear' }}
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                />
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-3">
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AdminInvitePage;
