
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Emitter } from '@/lib/emitter';

const liveStateFile = path.join(process.cwd(), 'live-state.json');

interface LiveState {
  isLive: boolean;
  currentPitchId: string | null;
  isWinnerShowcaseLive: boolean;
  showcasedCategoryId: string | null;
}

async function getLiveState(): Promise<LiveState> {
  try {
    const data = await fs.readFile(liveStateFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist or is invalid, return default state
    return {
      isLive: false,
      currentPitchId: null,
      isWinnerShowcaseLive: false,
      showcasedCategoryId: null,
    };
  }
}

async function setLiveState(newState: Partial<LiveState>) {
  const currentState = await getLiveState();
  const updatedState = { ...currentState, ...newState };
  await fs.writeFile(liveStateFile, JSON.stringify(updatedState, null, 2));
  // Notify all listeners about the change
  Emitter.emit('live-state-change', updatedState);
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
