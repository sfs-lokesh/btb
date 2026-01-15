
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Contestant from '@/models/Contestant';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    await dbConnect();
    // Return the currently active contestant
    // Provide minimal info or full info? Full.
    // Also include USER'S vote if authenticated?
    // For simplicity, just return active contestant.
    // Frontend can know if it voted by checking its own local state or better: 
    // Return Contestant + hasVoted boolean if user token provided?


    try {
        const active = await Contestant.findOne({ isActive: true });
        if (active) {
            const obj = active.toObject();
            if (active.imageBuffer && active.imageType && !active.image) {
                obj.image = `data:${active.imageType};base64,${active.imageBuffer.toString('base64')}`;
            }
            delete obj.imageBuffer;
            return NextResponse.json(obj);
        }
        return NextResponse.json(null);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}


export async function POST(req: NextRequest) { // Cast Vote
    await dbConnect();
    try {
        const userId = req.headers.get('x-user-id'); // Set by middleware if we used it, but here we don't have middleware injecting it yet.
        // We need robust auth here.
        // Let's use getAuth inside logic or rely on client sending user ID? 
        // No, must be secure.
        // Use requireAuth to get User.

        // However, requireAuth returns NextResponse on failure.
        // I'll implement custom auth extraction.

        const authResult = await requireAuth(req);
        if (authResult instanceof NextResponse) return authResult;

        // We need the ACTUAL user ID. 
        // `requireAuth` verifies token but doesn't easily return the payload unless we modify it or parse header again.
        // I will re-parse for now or modify requireAuth later. 
        // Actually I'll just use the header 'authorization' and parse it.
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

        // Decoding is done in requireAuth but we need the ID.
        // I'll trust `requireAuth` succeeded. I need to decode/verify again to get ID?
        // Or assume the client sends the ID and I trust it? NO.
        // I will use `jwt` verify.

        const { verifyToken } = await import('@/lib/auth');
        const decoded = verifyToken(token) as any;
        const userIdFromToken = decoded.userId;

        const { contestantId, type } = await req.json();

        // Find contestant
        const contestant = await Contestant.findById(contestantId);
        if (!contestant || !contestant.isActive) {
            return NextResponse.json({ error: 'Contestant not active' }, { status: 400 });
        }

        // Check if user already voted for THIS contestant
        const existingVoteIndex = contestant.votes.findIndex((v: any) => v.userId.toString() === userIdFromToken);

        if (existingVoteIndex > -1) {
            // Update vote
            contestant.votes[existingVoteIndex].type = type;
            contestant.votes[existingVoteIndex].timestamp = new Date();
        } else {
            // Add vote
            contestant.votes.push({ userId: userIdFromToken, type, timestamp: new Date() });
        }

        // Update total count ?? Or calculate it on the fly?
        // Let's purely rely on `votes.length` or recalc.
        // Wait, upvote/downvote usually means score.
        // Let's just store the votes array.

        await contestant.save();

        return NextResponse.json({ success: true, votes: contestant.votes });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
