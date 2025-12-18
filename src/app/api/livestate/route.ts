
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const liveStateFile = path.join(process.cwd(), 'live-state.json');

interface LiveState {
  isLive: boolean;
  currentPitchId: string | null;
  isLeaderboardLive: boolean;
}

async function getLiveState(): Promise<LiveState> {
  try {
    const data = await fs.readFile(liveStateFile, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    // If the file doesn't exist, create it with default state
    if (error.code === 'ENOENT') {
      const defaultState = {
        isLive: false,
        currentPitchId: null,
        isLeaderboardLive: false,
      };
      await fs.writeFile(liveStateFile, JSON.stringify(defaultState, null, 2));
      return defaultState;
    }
    // For other errors, return default state without writing file
    return {
      isLive: false,
      currentPitchId: null,
      isLeaderboardLive: false,
    };
  }
}

async function setLiveState(newState: Partial<LiveState>) {
  const currentState = await getLiveState();
  const updatedState = { ...currentState, ...newState };
  await fs.writeFile(liveStateFile, JSON.stringify(updatedState, null, 2));
  return updatedState;
}

export async function GET() {
  const state = await getLiveState();
  return NextResponse.json({ success: true, data: state });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updatedState = await setLiveState(body);
    return NextResponse.json({ success: true, data: updatedState });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
