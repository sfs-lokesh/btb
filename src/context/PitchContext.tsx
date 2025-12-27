'use client';

import type { Pitch, Category } from '@/lib/types';
import { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';

import { safeLocalStorage } from '@/lib/utils';

interface LiveState {
  isLive: boolean;
  currentPitchId: string | null;
  isLeaderboardLive: boolean;
}

type UserVote = 'up' | 'down' | null;

interface PitchContextType {
  pitches: Pitch[];
  categories: string[];
  isLiveMode: boolean;
  currentPitchId: string | null;
  loading: boolean;
  initialLoadComplete: boolean;
  isLeaderboardLive: boolean;
  userVotes: { [pitchId: string]: UserVote };
  addPitch: (pitch: Omit<Pitch, '_id' | 'netScore' | 'visible' | 'upvotes' | 'downvotes'>) => Promise<void>;
  removePitch: (pitchId: string) => Promise<void>;
  togglePitchVisibility: (pitchId: string, isVisible: boolean) => Promise<void>;
  handleVote: (pitchId: string, voteType: 'up' | 'down') => Promise<void>;
  getWinnerForCategory: (category: string) => Pitch | null;
  addCategory: (category: string, shouldFetchData?: boolean) => Promise<void>;
  removeCategory: (category: string) => Promise<void>;
  startLiveMode: () => void;
  endLiveMode: () => void;
  goToNextPitch: () => void;
  goToPreviousPitch: () => void;
  toggleLeaderboard: (isLive: boolean) => void;
  resetAllRatings: () => Promise<void>;
  isUserAuthenticated: boolean;
  setIsUserAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  resetSession: () => Promise<void>;
}

export const PitchContext = createContext<PitchContextType>({
  pitches: [],
  categories: [],
  isLiveMode: false,
  currentPitchId: null,
  loading: true,
  initialLoadComplete: false,
  isLeaderboardLive: false,
  userVotes: {},
  addPitch: async () => { },
  removePitch: async () => { },
  togglePitchVisibility: async () => { },
  handleVote: async () => { },
  getWinnerForCategory: () => null,
  addCategory: async () => { },
  removeCategory: async () => { },
  startLiveMode: () => { },
  endLiveMode: () => { },
  goToNextPitch: () => { },
  goToPreviousPitch: () => { },
  toggleLeaderboard: () => { },
  resetAllRatings: async () => { },
  isUserAuthenticated: false,
  setIsUserAuthenticated: () => { },
  resetSession: async () => { },
});

export function PitchProvider({ children }: { children: ReactNode }) {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentPitchId, setCurrentPitchId] = useState<string | null>(null);
  const [isLeaderboardLive, setIsLeaderboardLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [userVotes, setUserVotes] = useState<{ [pitchId: string]: UserVote }>({});
  const [sessionId, setSessionId] = useState('initial');
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const loadUserVotes = useCallback((currentSessionId: string) => {
    const votesFromStorage = safeLocalStorage.getItem(`userVotes_${currentSessionId}`);
    if (votesFromStorage) {
      setUserVotes(JSON.parse(votesFromStorage));
    } else {
      setUserVotes({});
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pitchesRes, categoriesRes, liveStateRes, sessionRes] = await Promise.all([
        fetch('/api/pitches'),
        fetch('/api/categories'),
        fetch('/api/livestate'),
        fetch('/api/session'),
      ]);

      if (pitchesRes.ok) {
        try {
          const pitchesData = await pitchesRes.json();
          if (pitchesData.success) {
            const pitchesWithNetScore = pitchesData.data.map((p: Pitch) => ({
              ...p,
              netScore: (p.upvotes?.length || 0) - (p.downvotes?.length || 0),
            }));
            setPitches(pitchesWithNetScore);
          }
        } catch (e: any) {
          console.error('Failed to parse pitches JSON', e)
        }
      }

      if (categoriesRes.ok) {
        try {
          const categoriesData = await categoriesRes.json();
          if (categoriesData.success) {
            setCategories(categoriesData.data.map((c: Category) => c.name));
          }
        } catch (e: any) {
          console.error('Failed to parse categories JSON', e)
        }
      }

      if (liveStateRes.ok) {
        try {
          const liveStateData = await liveStateRes.json();
          if (liveStateData.success && liveStateData.data) {
            setIsLiveMode(liveStateData.data.isLive);
            setCurrentPitchId(liveStateData.data.currentPitchId);
            setIsLeaderboardLive(liveStateData.data.isLeaderboardLive);
          }
        } catch (e: any) {
          console.error('Failed to parse live state JSON', e)
        }
      }

      if (sessionRes.ok) {
        try {
          const sessionData = await sessionRes.json();
          if (sessionData.success && sessionData.data.sessionId) {
            setSessionId(sessionData.data.sessionId);
            loadUserVotes(sessionData.data.sessionId);
          }
        } catch (e: any) {
          console.error('Failed to parse session JSON', e);
        }
      }

    } catch (error: any) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  }, [loadUserVotes]);

  // Define addCategory after fetchData so it can reference it
  const addCategory = useCallback(async (name: string, shouldFetchData = true) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok && shouldFetchData) {
        await fetchData();
      }
    } catch (error: any) {
      console.error('Failed to add category:', error);
    }
  }, [fetchData]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Robust polling for live state
  useEffect(() => {
    const fetchLiveState = async () => {
      try {
        const res = await fetch('/api/livestate');
        if (!res.ok) return;

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return;

        const liveStateData = await res.json();
        if (liveStateData.success && liveStateData.data) {
          const data = liveStateData.data;
          if (data) {
            setIsLiveMode(prev => prev !== data.isLive ? data.isLive : prev);
            setCurrentPitchId(prev => prev !== data.currentPitchId ? data.currentPitchId : prev);
            setIsLeaderboardLive(prev => prev !== data.isLeaderboardLive ? data.isLeaderboardLive : prev);
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch live state:", error);
      }
    };

    const intervalId = setInterval(fetchLiveState, 60000); // Poll every 60 seconds

    return () => clearInterval(intervalId);
  }, []);

  const updateLiveState = async (state: Partial<LiveState>) => {
    try {
      const res = await fetch('/api/livestate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      if (!res.ok) {
        throw new Error('Failed to update live state');
      }
      const data = await res.json();
      if (data.success && data.data) {
        setIsLiveMode(data.data.isLive);
        setCurrentPitchId(data.data.currentPitchId);
        setIsLeaderboardLive(data.data.isLeaderboardLive);
      }
    } catch (error: any) {
      console.error('Failed to update live state:', error);
    }
  };

  const addPitch = async (newPitch: Omit<Pitch, '_id' | 'netScore' | 'visible' | 'upvotes' | 'downvotes'>) => {
    try {
      const res = await fetch('/api/pitches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPitch, upvotes: [], downvotes: [], visible: true }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error: any) {
      console.error('Failed to add pitch:', error);
    }
  };

  const removePitch = async (pitchId: string) => {
    try {
      const res = await fetch(`/api/pitches/${pitchId}`, { method: 'DELETE' });
      if (res.ok) {
        setPitches(prev => prev.filter(p => p._id !== pitchId));
      }
    } catch (error: any) {
      console.error('Failed to remove pitch:', error);
    }
  };

  const togglePitchVisibility = async (pitchId: string, visible: boolean) => {
    setPitches(prev => prev.map(p => p._id === pitchId ? { ...p, visible } : p));
    try {
      await fetch(`/api/pitches/${pitchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible }),
      });
    } catch (error: any) {
      console.error('Failed to toggle visibility:', error);
      setPitches(prev => prev.map(p => p._id === pitchId ? { ...p, visible: !visible } : p));
    }
  };

  const handleVote = async (pitchId: string, voteType: 'up' | 'down') => {
    if (!isUserAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'You must be logged in to vote.',
        variant: 'destructive',
      });
      return;
    }

    const token = safeLocalStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Error',
        description: 'Your session is invalid. Please log in again.',
        variant: 'destructive',
      });
      return;
    }

    // Optimistic UI Update
    const originalPitches = pitches;
    const originalUserVotes = userVotes;
    const currentUserVote = userVotes[pitchId];

    // Update user votes state
    const newUserVotes = { ...userVotes, [pitchId]: currentUserVote === voteType ? null : voteType };
    setUserVotes(newUserVotes);
    safeLocalStorage.setItem(`userVotes_${sessionId}`, JSON.stringify(newUserVotes));

    // Update pitches state
    const updatedPitches = pitches.map(p => {
      if (p._id === pitchId) {
        let newUpvotes = p.upvotes.length;
        let newDownvotes = p.downvotes.length;

        if (currentUserVote === 'up') newUpvotes--;
        if (currentUserVote === 'down') newDownvotes--;

        if (currentUserVote !== 'up' && voteType === 'up') newUpvotes++;
        if (currentUserVote !== 'down' && voteType === 'down') newDownvotes++;

        return { ...p, netScore: newUpvotes - newDownvotes, upvotes: Array(newUpvotes), downvotes: Array(newDownvotes) };
      }
      return p;
    });
    setPitches(updatedPitches);

    try {
      const res = await fetch(`/api/pitches/${pitchId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voteType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit vote');
      }

      // Sync with server response
      setPitches(prevPitches => prevPitches.map(p => p._id === pitchId ? { ...p, netScore: data.data.netScore, upvotes: Array(data.data.upvotes), downvotes: Array(data.data.downvotes) } : p));

    } catch (error: any) {
      // Revert on failure
      setPitches(originalPitches);
      setUserVotes(originalUserVotes);
      safeLocalStorage.setItem(`userVotes_${sessionId}`, JSON.stringify(originalUserVotes));

      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: 'Vote Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getWinnerForCategory = useCallback((category: string): Pitch | null => {
    const categoryPitches = pitches.filter(
      (p) => p.category === category && ((p.upvotes?.length || 0) > 0 || (p.downvotes?.length || 0) > 0)
    );
    if (categoryPitches.length === 0) return null;
    return categoryPitches.sort((a, b) => b.netScore - a.netScore)[0];
  }, [pitches]);

  const removeCategory = async (name: string) => {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      } else {
        const { error } = await res.json();
        alert(`Failed to delete category: ${error}`);
      }
    } catch (error: any) {
      console.error('Failed to remove category:', error);
    }
  };

  const getSortedPitches = () => {
    const categoryOrder = categories;

    const visiblePitches = pitches.filter(p => p.visible);

    return visiblePitches.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  };

  const startLiveMode = () => {
    const sortedPitches = getSortedPitches();
    const firstPitchId = sortedPitches.length > 0 ? sortedPitches[0]._id : null;
    updateLiveState({ isLive: true, currentPitchId: firstPitchId });
  };

  const endLiveMode = () => {
    updateLiveState({ isLive: false, currentPitchId: null });
  };

  const goToNextPitch = () => {
    const sortedPitches = getSortedPitches();
    if (sortedPitches.length === 0) return;

    const currentIndex = sortedPitches.findIndex(p => p._id === currentPitchId);
    if (currentIndex > -1 && currentIndex < sortedPitches.length - 1) {
      updateLiveState({ currentPitchId: sortedPitches[currentIndex + 1]._id });
    }
  };

  const goToPreviousPitch = () => {
    const sortedPitches = getSortedPitches();
    if (sortedPitches.length === 0) return;

    const currentIndex = sortedPitches.findIndex(p => p._id === currentPitchId);
    if (currentIndex > 0) {
      updateLiveState({ currentPitchId: sortedPitches[currentIndex - 1]._id });
    }
  };

  const toggleLeaderboard = (isLive: boolean) => {
    updateLiveState({ isLeaderboardLive: isLive });
  };

  const resetAllRatings = async () => {
    try {
      const res = await fetch('/api/pitches/reset', { method: 'POST' });
      if (res.ok) {
        await fetchData(); // Refetches all data, including the new session ID
      } else {
        const { error } = await res.json();
        alert(`Failed to reset ratings: ${error}`);
      }
    } catch (error: any) {
      console.error('Failed to reset ratings:', error);
    }
  };

  const resetSession = async () => {
    try {
      const res = await fetch('/api/session/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const newSessionId = data.data.sessionId;
        setSessionId(newSessionId);
        setUserVotes({}); // Clear user votes in context state
        // The localStorage for the old session is now simply ignored
      }
    } catch (error: any) {
      console.error('Failed to reset session:', error);
    }
  };


  const value = {
    pitches,
    categories,
    isLiveMode,
    currentPitchId,
    loading,
    initialLoadComplete,
    isLeaderboardLive,
    userVotes,
    addPitch,
    removePitch,
    togglePitchVisibility,
    handleVote,
    getWinnerForCategory,
    addCategory,
    removeCategory,
    startLiveMode,
    endLiveMode,
    goToNextPitch,
    goToPreviousPitch,
    toggleLeaderboard,
    resetAllRatings,
    isUserAuthenticated,
    setIsUserAuthenticated,
    resetSession,
  };

  return (
    <PitchContext.Provider value={value}>{children}</PitchContext.Provider>
  );
}
