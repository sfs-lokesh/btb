"use client";

import { useContext } from 'react';
import { PitchContext } from '@/context/PitchContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export function Leaderboard() {
  const { categories, getWinnerForCategory } = useContext(PitchContext);

  const winners = categories
    .map(category => getWinnerForCategory(category))
    .filter((winner): winner is NonNullable<typeof winner> => winner !== null);

  if (winners.length === 0) {
    return (
      <Card className="mb-12 bg-accent/50 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl">
            <Trophy className="w-8 h-8 text-primary" />
            Live Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No winners yet. Votes are being tallied!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-12 bg-accent/50 border-primary">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Live Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {winners.map(winner => (
            <div key={winner._id} className="bg-card p-4 rounded-lg shadow-md flex flex-col items-center text-center">
              <Badge variant="secondary" className="mb-2">{winner.category}</Badge>
              <div className="w-24 h-24 relative rounded-full overflow-hidden mb-4 border-4 border-yellow-400">
                <Image
                  src={winner.imageUrl}
                  alt={winner.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                  data-ai-hint="product photo"
                />
              </div>
              <h4 className="font-bold text-lg">{winner.title}</h4>
              <p className="text-sm text-muted-foreground">by {winner.presenter}</p>
              <div className="flex items-center gap-2 mt-3 text-xl font-bold text-primary">
                <Star className="w-5 h-5 fill-primary" />
                <span>{winner.netScore}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
