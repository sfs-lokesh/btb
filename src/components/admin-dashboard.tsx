"use client";

import { useState, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Rocket, Trash2, RotateCcw, PanelTop, ArrowUp, ArrowDown } from 'lucide-react';
import { Label } from '@/components/ui/label';

import type { Pitch } from '@/lib/types';
import { PitchContext } from '@/context/PitchContext';
import { AdminLayout } from '@/components/admin-layout';
import { AddPitchDialog } from '@/components/add-pitch-dialog';
import { CategoryManager } from '@/components/category-manager';

// Sub-component for the dashboard header
function DashboardHeader({ onAddPitch, onGoLive, canGoLive }: { onAddPitch: () => void; onGoLive: () => void; canGoLive: boolean; }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-bold">Admin Dashboard</h2>
      <div className="flex items-center gap-4">
        <Button onClick={onAddPitch}>Add New Pitch</Button>
        <Button onClick={onGoLive} disabled={!canGoLive}>
          <Rocket className="mr-2 h-5 w-5" />
          Go Live
        </Button>
      </div>
    </div>
  );
}

// Sub-component for managing the leaderboard
function LeaderboardManager() {
    const { isLeaderboardLive, toggleLeaderboard } = useContext(PitchContext);

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><PanelTop /> Leaderboard Control</CardTitle>
                <CardDescription>
                    Show or hide the winner's leaderboard on the main page for all users.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="leaderboard-switch"
                        checked={isLeaderboardLive}
                        onCheckedChange={toggleLeaderboard}
                    />
                    <Label htmlFor="leaderboard-switch" className="text-base">
                        {isLeaderboardLive ? "Leaderboard is Live" : "Leaderboard is Hidden"}
                    </Label>
                </div>
            </CardContent>
        </Card>
    );
}


// Sub-component for a single category's pitch table
function PitchCategoryTable({ category, pitches }: { category: string, pitches: Pitch[] }) {
    const { getWinnerForCategory, togglePitchVisibility, removePitch } = useContext(PitchContext);
    const [pitchToDelete, setPitchToDelete] = useState<Pitch | null>(null);
    const winner = getWinnerForCategory(category);

    const sortedPitches = useMemo(() => 
        [...pitches].sort((a, b) => b.netScore - a.netScore),
    [pitches]);

    const confirmDelete = (pitch: Pitch) => {
        setPitchToDelete(pitch);
    };

    const handleDelete = () => {
        if (pitchToDelete) {
            removePitch(pitchToDelete._id);
            setPitchToDelete(null);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">{category}</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Pitch Title</TableHead>
                        <TableHead>Presenter</TableHead>
                        <TableHead className="text-center">Visible</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedPitches.map((pitch) => (
                        <TableRow key={pitch._id} className={pitch._id === winner?._id ? 'bg-accent/50' : ''}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {pitch.title}
                                    {pitch._id === winner?._id && <Crown className="h-5 w-5 text-yellow-500" />}
                                </div>
                            </TableCell>
                            <TableCell>{pitch.presenter}</TableCell>
                            <TableCell className="text-center">
                                <Switch
                                    checked={pitch.visible}
                                    onCheckedChange={(checked) => togglePitchVisibility(pitch._id, checked)}
                                />
                            </TableCell>
                             <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-4">
                                    <div className="flex items-center gap-1 text-green-500">
                                        <ArrowUp className="h-4 w-4" /> {pitch.upvotes.length}
                                    </div>
                                    <div className="flex items-center gap-1 text-red-500">
                                        <ArrowDown className="h-4 w-4" /> {pitch.downvotes.length}
                                    </div>
                                    <Badge variant="secondary" className="text-base">
                                        {pitch.netScore}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => confirmDelete(pitch)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            
            <AlertDialog open={!!pitchToDelete} onOpenChange={() => setPitchToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the pitch for "{pitchToDelete?.title}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Main AdminDashboard Component
export function AdminDashboard() {
  const { pitches, loading, startLiveMode, resetAllRatings, resetSession } = useContext(PitchContext);
  const [isAddPitchOpen, setIsAddPitchOpen] = useState(false);
  const [isResetRatingsOpen, setIsResetRatingsOpen] = useState(false);
  const router = useRouter();

  const handleGoLive = () => {
    startLiveMode();
    router.push('/presenter');
  };

  const handleResetRatings = async () => {
    await resetAllRatings();
    await resetSession();
    setIsResetRatingsOpen(false);
  };
  
  const pitchesByCategory = useMemo(() => {
    return pitches.reduce((acc, pitch) => {
        if (!acc[pitch.category]) acc[pitch.category] = [];
        acc[pitch.category].push(pitch);
        return acc;
    }, {} as Record<string, Pitch[]>);
  }, [pitches]);

  const sortedCategories = useMemo(() => Object.keys(pitchesByCategory).sort(), [pitchesByCategory]);
  const canGoLive = useMemo(() => pitches.some(p => p.visible), [pitches]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <AdminLayout>
        <div className="p-4 sm:p-6 md:p-8">
          <DashboardHeader 
            onAddPitch={() => setIsAddPitchOpen(true)}
            onGoLive={handleGoLive}
            canGoLive={canGoLive}
          />
          
          <CategoryManager />
          <Separator className="my-8" />
          <LeaderboardManager />

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Pitch Management</CardTitle>
                  <CardDescription>
                    An overview of all submitted pitches, grouped by category.
                  </CardDescription>
                </div>
                <Button variant="destructive" onClick={() => setIsResetRatingsOpen(true)}>
                    <RotateCcw className="mr-2" />
                    Reset All Votes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sortedCategories.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No pitches have been added yet. Click "Add New Pitch" to get started.
                </div>
              ) : (
                <div className="space-y-8">
                  {sortedCategories.map((category) => (
                    <PitchCategoryTable
                      key={category}
                      category={category}
                      pitches={pitchesByCategory[category]}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>

      <AddPitchDialog isOpen={isAddPitchOpen} onClose={() => setIsAddPitchOpen(false)} />

      <AlertDialog open={isResetRatingsOpen} onOpenChange={setIsResetRatingsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Votes?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will reset all votes for every pitch to 0 and clear voter history for a new session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetRatings} className="bg-destructive hover:bg-destructive/90">
              Reset Votes & Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
