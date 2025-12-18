
'use client';

import { useContext, useEffect } from 'react';
import { LivePitchView } from '@/components/live-pitch-view';
import { PitchContext } from '@/context/PitchContext';
import { useRouter } from 'next/navigation';

export default function LivePage() {
  const { pitches, currentPitchId, isLiveMode, loading, initialLoadComplete } = useContext(PitchContext);
  const router = useRouter();

  useEffect(() => {
    if (initialLoadComplete && !isLiveMode) {
      router.push('/');
    }
  }, [initialLoadComplete, isLiveMode, router]);

  const currentPitch = pitches.find((p) => p._id === currentPitchId);

  if (loading || !initialLoadComplete || !isLiveMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Waiting for the event to start...</p>
      </div>
    );
  }

  return <LivePitchView pitch={currentPitch} />;
}
