
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Contestant from '@/models/Contestant';
import { requireAuth, ROLES } from '@/lib/auth';

export async function GET(req: NextRequest) {
    await dbConnect();
    // Publicly verify if admin (optional, maybe public allows viewing all?)
    // For Admin Panel: List all
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const contestants = await Contestant.find({}).sort({ createdAt: -1 }).populate('votes.userId', 'name email');
        return NextResponse.json(contestants);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const body = await req.json();
        const newContestant = await Contestant.create(body);
        return NextResponse.json(newContestant, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) { // For Activate/Deactivate/Update
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const body = await req.json();
        const { _id, ...updates } = body;

        // Special handling for 'isActive'
        if (updates.isActive === true) {
            // Deactivate all others first
            await Contestant.updateMany({ _id: { $ne: _id } }, { isActive: false });
        }

        const updated = await Contestant.findByIdAndUpdate(_id, updates, { new: true });
        return NextResponse.json(updated);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await Contestant.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
