
'use client';

import { useContext, useEffect } from 'react';
import { PitchContext } from '@/context/PitchContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, XSquare } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';

function PresenterMode() {
  const {
    pitches,
    currentPitchId,
    goToNextPitch,
    goToPreviousPitch,
    endLiveMode,
    isLiveMode,
    loading,
    initialLoadComplete,
  } = useContext(PitchContext);
  const router = useRouter();

  useEffect(() => {
    if (initialLoadComplete && !isLiveMode) {
      router.push('/admin');
    }
  }, [initialLoadComplete, isLiveMode, router]);

  const currentPitch = pitches.find((p) => p._id === currentPitchId);

  const handleEndSession = () => {
    endLiveMode();
    router.push('/admin');
  };

  if (loading || !initialLoadComplete) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        Loading Presenter Mode...
      </div>
    );
  }

  if (!currentPitch) {
     return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        Waiting for pitch...
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-gray-900 p-8 text-white">
      <div className="absolute top-4 right-4">
        <Button variant="destructive" onClick={handleEndSession}>
          <XSquare className="mr-2 h-5 w-5" />
          End Session
        </Button>
      </div>

      <div className="text-center">
        <p className="text-2xl font-semibold text-gray-400">
          {currentPitch.category}
        </p>
        <h1 className="my-4 text-7xl font-bold tracking-tight">
          {currentPitch.title}
        </h1>
        <h2 className="text-4xl text-gray-300">
          by {currentPitch.presenter}
        </h2>
      </div>

      <div className="absolute bottom-10 flex w-full justify-between px-20">
        <Button
          size="lg"
          variant="outline"
          className="bg-transparent text-white hover:bg-white/10"
          onClick={goToPreviousPitch}
        >
          <ArrowLeft className="mr-2" /> Previous
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="bg-transparent text-white hover:bg-white/10"
          onClick={goToNextPitch}
        >
          Next <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

export default function PresenterPage() {
    return (
        <ProtectedRoute>
            <PresenterMode />
        </ProtectedRoute>
    )
}
