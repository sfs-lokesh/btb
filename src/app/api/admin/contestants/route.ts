import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Contestant from '@/models/Contestant';
import { requireAuth, ROLES } from '@/lib/auth';

export async function GET(req: NextRequest) {
    await dbConnect();
    // Publicly verify if admin (optional, maybe public allows viewing all?)
    // For Admin Panel: List all
    try {
        // Allow public access for now as dashboard might need it, check Auth if strictly admin
        // const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        // if (auth instanceof NextResponse) return auth;

        const contestants = await Contestant.find({}).sort({ createdAt: -1 }).populate('votes.userId', 'name email');

        // Transform for backward compatibility if needed, but cleaner to just prefer 'image' URL
        const contestantsWithImage = contestants.map(c => {
            const obj = c.toObject();
            if (c.imageBuffer && c.imageType && !c.image) {
                obj.image = `data:${c.imageType};base64,${c.imageBuffer.toString('base64')}`;
            }
            // Remove heavy buffer from response
            delete obj.imageBuffer;
            return obj;
        });

        return NextResponse.json(contestantsWithImage);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const contentType = req.headers.get('content-type') || '';
        let data: any = {};

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('image') as File | null;

            // Handle Image Upload to MongoDB Buffer
            if (file && file.size > 0) {
                const bytes = await file.arrayBuffer();
                data.imageBuffer = Buffer.from(bytes);
                data.imageType = file.type;
            }

            formData.forEach((value, key) => {
                // EXCLUDE 'votes' to prevent casting error
                if (key !== 'image' && key !== 'votes') {
                    data[key] = value;
                }
            });
        } else {
            data = await req.json();
            // Also protect JSON path just in case
            if (data.votes) delete data.votes;
        }

        const newContestant = await Contestant.create(data);
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

        const contentType = req.headers.get('content-type') || '';
        let updates: any = {};
        let _id;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('image') as File | null;

            if (file && file.size > 0) {
                const bytes = await file.arrayBuffer();
                updates.imageBuffer = Buffer.from(bytes);
                updates.imageType = file.type;
            }

            formData.forEach((value, key) => {
                // EXCLUDE 'votes'
                if (key !== 'image' && key !== 'votes') {
                    updates[key] = value;
                }
            });
            _id = updates._id;
            delete updates._id;
        } else {
            const body = await req.json();
            _id = body._id;
            Object.assign(updates, body);
            delete updates._id;
            if (updates.votes) delete updates.votes;
        }

        if (!_id) {
            return NextResponse.json({ error: "Missing _id" }, { status: 400 });
        }

        // Special handling for 'isActive'
        if (updates.isActive === 'true' || updates.isActive === true) {
            updates.isActive = true;
            await Contestant.updateMany({ _id: { $ne: _id } }, { isActive: false });
        } else if (updates.isActive === 'false') {
            updates.isActive = false;
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
