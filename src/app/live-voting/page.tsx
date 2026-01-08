
'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PitchCard } from '@/components/pitch-card';
import { PitchContext } from '@/context/PitchContext';
import type { Pitch } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Leaderboard } from '@/components/leaderboard';
import { safeLocalStorage } from '@/lib/utils';

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isUserAuthenticated, loading: contextLoading } = useContext(PitchContext);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = safeLocalStorage.getItem('token');
        if (!contextLoading) {
            if (!token) {
                router.replace('/login');
            } else {
                setIsLoading(false);
            }
        }
    }, [isUserAuthenticated, contextLoading, router]);

    if (isLoading || contextLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    return <>{children}</>;
}


import { LiveVotingPanel } from '@/components/LiveVotingPanel';

export default function LiveVotingPage() {
    // AuthGuard logic stays same, or I can copy it here if I am replacing the whole file content in a way that needs it.
    // The previous file content had AuthGuard defined locally. 
    // I should preserve AuthGuard definition if I am not importing it.

    // Actually, I'll just replace the component body.

    const { isUserAuthenticated, loading: contextLoading } = useContext(PitchContext);
    // ... AuthGuard logic ... 

    // Wait, replacing the whole file is cleaner.

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background pt-32 px-4">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-2">Live Voting Event</h1>
                    <p className="text-center text-muted-foreground mb-8">Watch the pitch and cast your vote in real-time.</p>
                    <LiveVotingPanel />
                </div>
            </div>
        </AuthGuard>
    );
}
