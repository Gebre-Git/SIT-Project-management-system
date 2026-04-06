import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProfileAvatarProps {
    photoURL?: string | null;
    displayName?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
    photoURL,
    displayName,
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl'
    };

    const getInitials = () => {
        if (!displayName) return '?';
        const names = displayName.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return displayName.substring(0, 2).toUpperCase();
    };

    if (photoURL) {
        return (
            <img
                src={photoURL}
                alt={displayName || 'User'}
                className={cn(sizeClasses[size], "rounded-full object-cover flex-shrink-0", className)}
            />
        );
    }

    return (
        <div className={cn(sizeClasses[size], "rounded-full bg-gradient-to-br from-sit-orange to-sit-yellow flex items-center justify-center font-semibold text-white flex-shrink-0", className)}>
            {displayName ? getInitials() : <User className="w-1/2 h-1/2" />}
        </div>
    );
};

export default ProfileAvatar;
