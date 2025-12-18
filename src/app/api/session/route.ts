
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const sessionStateFile = path.join(process.cwd(), 'session-state.json');

interface SessionState {
  sessionId: string;
}

async function getSessionState(): Promise<SessionState> {
  try {
    const data = await fs.readFile(sessionStateFile, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      const newSessionId = crypto.randomBytes(16).toString('hex');
      const defaultState = { sessionId: newSessionId };
      await fs.writeFile(sessionStateFile, JSON.stringify(defaultState, null, 2));
      return defaultState;
    }
    const fallbackSessionId = crypto.randomBytes(16).toString('hex');
    return { sessionId: fallbackSessionId };
  }
}

export async function GET() {
  const state = await getSessionState();
  return NextResponse.json({ success: true, data: state });
}
