import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, User, LogOut } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';
import { cn } from '../lib/utils';

interface ProfileDropdownProps {
    collapsed?: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ collapsed = false }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadProfilePhoto = async () => {
            if (!currentUser) return;
            try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists() && userDoc.data().photoURL) {
                    setPhotoURL(userDoc.data().photoURL);
                }
            } catch (error) {
                console.error("Error loading profile photo:", error);
            }
        };

        loadProfilePhoto();
    }, [currentUser]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!currentUser) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300",
                    collapsed ? "justify-center w-full p-2" : "gap-2 px-3 py-2"
                )}
                title={collapsed ? currentUser.displayName || 'Profile' : undefined}
            >
                <ProfileAvatar
                    photoURL={photoURL || currentUser.photoURL}
                    displayName={currentUser.displayName}
                    size={collapsed ? 'lg' : 'md'}
                    className={cn(
                        "transition-all duration-300",
                        collapsed ? "ring-4 ring-sit-orange/10 hover:ring-sit-orange/30 hover:scale-105 shadow-xl shadow-sit-orange/10" : "ring-transparent"
                    )}
                />
                {!collapsed && (
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{currentUser.displayName}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-1">{currentUser.email}</p>
                    </div>
                )}
                {!collapsed && <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{currentUser.displayName}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">{currentUser.email}</p>
                    </div>
                    <div className="py-2">
                        <button
                            onClick={() => {
                                navigate('/profile');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        >
                            <User className="w-4 h-4" />
                            Edit Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
