
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const sessionStateFile = path.join(process.cwd(), 'session-state.json');

export async function POST() {
  try {
    const newSessionId = crypto.randomBytes(16).toString('hex');
    const newState = { sessionId: newSessionId };
    await fs.writeFile(sessionStateFile, JSON.stringify(newState, null, 2));
    return NextResponse.json({ success: true, data: newState });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
