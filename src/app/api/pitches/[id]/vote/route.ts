import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pitch from '@/models/Pitch';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough';

interface TokenPayload {
  id: string;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: pitchId } = await params;

  if (!Types.ObjectId.isValid(pitchId)) {
    return NextResponse.json({ success: false, error: 'Invalid Pitch ID' }, { status: 400 });
  }

  await dbConnect();

  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const userId = new Types.ObjectId(decoded.id);

    const { voteType } = await request.json(); // 'up' or 'down'

    if (voteType !== 'up' && voteType !== 'down') {
      return NextResponse.json({ success: false, error: 'Invalid vote type' }, { status: 400 });
    }

    const pitch = await Pitch.findById(pitchId);
    if (!pitch) {
      return NextResponse.json({ success: false, error: 'Pitch not found' }, { status: 404 });
    }

    const upvoted = pitch.upvotes.includes(userId);
    const downvoted = pitch.downvotes.includes(userId);

    let update: any = {};

    if (voteType === 'up') {
      if (upvoted) {
        // User is removing their upvote
        update = { $pull: { upvotes: userId } };
      } else {
        // User is adding an upvote, remove downvote if it exists
        update = { $addToSet: { upvotes: userId }, $pull: { downvotes: userId } };
      }
    } else if (voteType === 'down') {
      if (downvoted) {
        // User is removing their downvote
        update = { $pull: { downvotes: userId } };
      } else {
        // User is adding a downvote, remove upvote if it exists
        update = { $addToSet: { downvotes: userId }, $pull: { upvotes: userId } };
      }
    }

    const updatedPitch = await Pitch.findByIdAndUpdate(pitchId, update, { new: true });

    const responseData = {
      upvotes: updatedPitch.upvotes.length,
      downvotes: updatedPitch.downvotes.length,
      netScore: updatedPitch.upvotes.length - updatedPitch.downvotes.length
    }

    return NextResponse.json({ success: true, data: responseData });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
