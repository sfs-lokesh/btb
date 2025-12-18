import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pitch from '@/models/Pitch';

export async function POST() {
  await dbConnect();
  try {
    // This updates all documents in the Pitch collection, setting upvotes and downvotes to empty arrays.
    await Pitch.updateMany({}, { $set: { upvotes: [], downvotes: [] } });
    return NextResponse.json({ success: true, message: 'All votes have been reset.' });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
