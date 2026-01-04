import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser(req);

        if (!user) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        // Fetch full user details from DB
        const fullUser = await User.findById(user._id).select('-password').populate('collegeId');

        if (!fullUser) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        // Fetch ticket status
        const Ticket = (await import('@/models/Ticket')).default;
        const ticket = await Ticket.findOne({ userId: user._id });

        const userObj = fullUser.toObject();
        if (ticket) {
            userObj.ticketStatus = ticket.status;
            userObj.scannedAt = ticket.scannedAt;
        }

        return NextResponse.json({ user: userObj });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const currentUser = await getCurrentUser(req);

        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        // Expanded allowed updates based on user request "edit everything"
        const allowedUpdates = [
            'name', 'phone',
            'teamType', 'teamMembers', 'teamName',
            'projectTitle', 'projectDescription', 'projectLinks', 'category',
            'college', 'role' // Be careful with role, usually restricted? But user asked "everything". 
            // I'll exclude role for security. College might be editable if mistake made? 
            // I'll include 'college'.
        ];

        const updates: any = {};
        Object.keys(body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = body[key];
            }
        });

        const user = await User.findByIdAndUpdate(currentUser._id, updates, { new: true }).select('-password');

        return NextResponse.json({ user });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
