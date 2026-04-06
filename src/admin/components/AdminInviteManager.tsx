import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Send, Copy, CheckCircle, Loader2, AlertCircle, Link2 } from 'lucide-react';

const AdminInviteManager: React.FC = () => {
    const { currentUser } = useAuth();
    const [email, setEmail] = useState('');
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!email.trim() || !currentUser) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        setError(null);
        setInviteLink(null);

        try {
            const tokenId = crypto.randomUUID();
            const now = Timestamp.now();
            const expiresAt = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);

            const tokenDoc = {
                token: tokenId,
                createdAt: now,
                expiresAt: expiresAt,
                used: false,
                usedByUid: null,
                email: email.toLowerCase().trim(),
                createdByUid: currentUser.uid,
            };

            await setDoc(doc(db, 'adminInvitationTokens', tokenId), tokenDoc);

            // Build the link based on current origin
            const baseUrl = window.location.origin;
            setInviteLink(`${baseUrl}/admin-invite?token=${tokenId}`);
            setEmail('');
        } catch (err: any) {
            console.error('Generate invite error:', err);
            setError(err.message || 'Failed to generate invite link.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (inviteLink) {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-sit-orange to-sit-yellow shadow-lg shadow-sit-orange/25">
                    <Link2 className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Invite Super-Admin</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Generate a 24-hour invite link</p>
                </div>
            </div>

            <div className="flex gap-3">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="recipient@email.com"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sit-orange/50 focus:border-sit-orange transition-all disabled:opacity-50"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                    onClick={handleGenerate}
                    disabled={loading || !email.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sit-orange to-sit-yellow text-white text-sm font-medium hover:from-sit-orange/90 hover:to-sit-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sit-orange/25 hover:shadow-sit-orange/40 flex items-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                    Generate
                </button>
            </div>

            {error && (
                <div className="mt-4 flex items-center gap-2 text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800/50">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {inviteLink && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Invite Generated!</span>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={inviteLink}
                            className="flex-1 px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 text-slate-700 dark:text-slate-300 font-mono"
                        />
                        <button
                            onClick={handleCopy}
                            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                        >
                            {copied ? (
                                <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-2">
                        This link expires in 24 hours and can only be used once.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminInviteManager;
