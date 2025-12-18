
"use client";

import type { Pitch } from '@/lib/types';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useContext } from 'react';
import { PitchContext } from '@/context/PitchContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PitchCardProps {
  pitch: Pitch;
}

export function PitchCard({ pitch }: PitchCardProps) {
  const { handleVote, isLiveMode, userVotes } = useContext(PitchContext);

  const imageUrl = pitch.imageUrl && pitch.imageUrl.startsWith('http')
    ? pitch.imageUrl
    : 'https://picsum.photos/600/400';
  
  const userVote = userVotes[pitch._id];

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="aspect-video relative overflow-hidden rounded-t-lg -mt-6 -mx-6 mb-4">
            <Image
              src={imageUrl}
              alt={pitch.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint="product photo"
              priority
            />
          </div>
          <div className='flex justify-between items-start'>
            <CardTitle>{pitch.title}</CardTitle>
            <Badge variant="outline">{pitch.category}</Badge>
          </div>
          <CardDescription>Presented by {pitch.presenter}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-muted-foreground">{pitch.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
         <div className="flex items-center gap-2 text-muted-foreground">
            <ThumbsUp className="h-5 w-5 text-green-500" /> 
            <span className="font-bold text-lg text-foreground">{pitch.upvotes?.length || 0}</span>
            <ThumbsDown className="h-5 w-5 text-red-500 ml-2" />
             <span className="font-bold text-lg text-foreground">{pitch.downvotes?.length || 0}</span>
          </div>
          {isLiveMode && (
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={() => handleVote(pitch._id, 'up')} className={cn(userVote === 'up' && 'bg-green-500/20 border-green-500')}>
                <ThumbsUp className={cn("h-5 w-5", userVote === 'up' ? 'text-green-500 fill-green-500' : 'text-muted-foreground' )}/>
              </Button>
              <Button size="icon" variant="outline" onClick={() => handleVote(pitch._id, 'down')} className={cn(userVote === 'down' && 'bg-red-500/20 border-red-500')}>
                <ThumbsDown className={cn("h-5 w-5", userVote === 'down' ? 'text-red-500 fill-red-500' : 'text-muted-foreground' )}/>
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
