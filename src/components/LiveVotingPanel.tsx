
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { safeLocalStorage } from '@/lib/utils';

export function LiveVotingPanel() {
    const [activeContestant, setActiveContestant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [voteSelection, setVoteSelection] = useState<'up' | 'down' | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    // Poll for active contestant
    useEffect(() => {
        const fetchActive = async () => {
            try {
                const res = await fetch('/api/voting');
                if (res.ok) {
                    const data = await res.json();
                    // Detect if contestant changed to reset local selection if needed
                    setActiveContestant((prev: any) => {
                        if (!prev || prev._id !== data._id) {
                            setVoteSelection(null); // Reset selection for new contestant
                        }
                        return data;
                    });
                } else {
                    setActiveContestant(null);
                }
            } catch (error) {
                console.error('Polling error', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActive();
        const interval = setInterval(fetchActive, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmitVote = async () => {
        if (!activeContestant || !voteSelection) return;

        setSubmitting(true);
        try {
            const token = safeLocalStorage.getItem('token');
            const res = await fetch('/api/voting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contestantId: activeContestant._id,
                    type: voteSelection
                })
            });

            if (res.ok) {
                toast({ title: "Vote Submitted", description: `You successfully voted ${voteSelection}!` });
                // We don't clear selection, so user sees what they voted.
            } else {
                const err = await res.json();
                toast({ title: "Vote Failed", description: err.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to submit vote", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    if (!activeContestant) {
        return (
            <Card className="w-full max-w-4xl mx-auto my-8">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                    <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
                    <h2 className="text-2xl font-semibold">Voting has not started yet.</h2>
                    <p>Please stay tuned for the next contestant.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-4xl mx-auto my-8 border-primary/20 shadow-lg">
            <CardHeader className="text-center border-b bg-muted/30">
                <div className="flex justify-center mb-4">
                    <img
                        src={activeContestant.image || 'https://via.placeholder.com/150'}
                        alt={activeContestant.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-md"
                    />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    {activeContestant.teamName}
                </CardTitle>
                <CardDescription className="text-lg text-foreground font-medium">
                    {activeContestant.projectTitle}
                </CardDescription>
                <div className="text-sm text-muted-foreground mt-2">
                    by {activeContestant.name} • {activeContestant.category}
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <div className="bg-secondary/20 p-6 rounded-lg border">
                    <h3 className="font-semibold mb-2">Project Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        {activeContestant.projectDescription}
                    </p>
                    {activeContestant.projectLinks && (
                        <div className="mt-4 pt-4 border-t">
                            <a href={activeContestant.projectLinks} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                View Project / Documents
                            </a>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-6 pt-4">
                    <h3 className="text-xl font-bold">Cast Your Vote</h3>

                    <div className="flex gap-8">
                        <button
                            onClick={() => setVoteSelection('up')}
                            className={`flex flex-col items-center gap-2 p-6 rounded-2xl border-2 transition-all ${voteSelection === 'up'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 scale-105 shadow-md'
                                : 'border-muted hover:border-green-200'
                                }`}
                        >
                            <div className={`p-4 rounded-full ${voteSelection === 'up' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <ThumbsUp className="w-8 h-8" />
                            </div>
                            <span className={`font-semibold ${voteSelection === 'up' ? 'text-green-600' : 'text-muted-foreground'}`}>Upvote</span>
                        </button>

                        <button
                            onClick={() => setVoteSelection('down')}
                            className={`flex flex-col items-center gap-2 p-6 rounded-2xl border-2 transition-all ${voteSelection === 'down'
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 scale-105 shadow-md'
                                : 'border-muted hover:border-red-200'
                                }`}
                        >
                            <div className={`p-4 rounded-full ${voteSelection === 'down' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <ThumbsDown className="w-8 h-8" />
                            </div>
                            <span className={`font-semibold ${voteSelection === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>Downvote</span>
                        </button>
                    </div>

                    <Button
                        size="lg"
                        className="w-full max-w-sm text-lg mt-4"
                        disabled={!voteSelection || submitting}
                        onClick={handleSubmitVote}
                    >
                        {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                        Submit Vote
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
