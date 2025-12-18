
'use client';

import type { Pitch } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useContext } from 'react';
import { PitchContext } from '@/context/PitchContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LivePitchViewProps {
  pitch: Pitch | undefined;
}

export function LivePitchView({ pitch }: LivePitchViewProps) {
  const { handleVote, userVotes, isLiveMode } = useContext(PitchContext);

  const imageUrl = pitch?.imageUrl && pitch.imageUrl.startsWith('http')
    ? pitch.imageUrl
    : 'https://picsum.photos/600/400';

  const userVote = pitch ? userVotes[pitch._id] : null;

  return (
    <div className="flex flex-col min-h-screen bg-background pt-24">
        <main className="flex-1 flex items-center justify-center p-4">
          {!pitch ? (
            <div className="text-center">
              <h2 className="text-3xl font-bold">Waiting for the next pitch...</h2>
              <p className="text-muted-foreground mt-2">The presentation will begin shortly.</p>
            </div>
          ) : (
            <div className="container max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={pitch.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  data-ai-hint="product photo"
                />
              </div>
              <div className="space-y-4">
                <Badge variant="outline">{pitch.category}</Badge>
                <h1 className="text-4xl font-bold">{pitch.title}</h1>
                <p className="text-lg text-muted-foreground">
                  Presented by <span className="font-semibold">{pitch.presenter}</span>
                </p>
                <p>{pitch.description}</p>
                {isLiveMode && (
                  <div className='flex justify-between items-center pt-4'>
                    <div className="flex items-center gap-4">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleVote(pitch._id, 'up')}
                        className={cn("gap-2", userVote === 'up' && 'bg-green-500/20 border-green-500 text-green-500 hover:bg-green-500/30')}
                      >
                        <ThumbsUp className={cn(userVote === 'up' && 'fill-current')} />
                        Upvote
                      </Button>
                       <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleVote(pitch._id, 'down')}
                        className={cn("gap-2", userVote === 'down' && 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30')}
                      >
                        <ThumbsDown className={cn(userVote === 'down' && 'fill-current')} />
                        Downvote
                      </Button>
                    </div>
                     <div className="text-right">
                        <p className="text-sm text-muted-foreground">Net Score</p>
                        <p className="text-2xl font-bold">{pitch.netScore}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
  );
}
