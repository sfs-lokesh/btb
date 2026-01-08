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
        if (fullUser.profileImage && fullUser.profileImageType) {
            userObj.profileImage = `data:${fullUser.profileImageType};base64,${fullUser.profileImage.toString('base64')}`;
        }

        if (ticket) {
            userObj.ticketStatus = ticket.status;
            userObj.scannedAt = ticket.scannedAt;
            userObj.ticketPrice = ticket.price;
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

        const contentType = req.headers.get('content-type') || '';
        const updates: any = {};

        const allowedUpdates = [
            'name', 'phone',
            'teamType', 'teamMembers', 'teamName',
            'projectTitle', 'projectDescription', 'projectLinks', 'category',
            'college', 'companyName', 'designation'
        ];

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('profileImage') as File | null;

            if (file && file.size > 0) {
                const bytes = await file.arrayBuffer();
                updates.profileImage = Buffer.from(bytes);
                updates.profileImageType = file.type;
            }

            formData.forEach((value, key) => {
                if (allowedUpdates.includes(key)) {
                    if (key === 'teamMembers' && typeof value === 'string') {
                        updates[key] = value.split(',').map(s => s.trim()).filter(Boolean);
                    } else {
                        updates[key] = value;
                    }
                }
            });
        } else {
            const body = await req.json();
            Object.keys(body).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    updates[key] = body[key];
                }
            });
        }

        // Auto-update teamType based on members count if teamMembers is being updated
        if (updates.teamMembers) {
            const count = updates.teamMembers.length;
            if (count === 0) updates.teamType = 'Solo';
            else if (count === 1) updates.teamType = 'Team of 2';
            else if (count === 2) updates.teamType = 'Team of 3';
            else if (count >= 3) updates.teamType = 'Team of 4';
        }

        const user = await User.findByIdAndUpdate(currentUser._id, updates, { new: true }).select('-password');

        // Convert buffer to base64 for response if needed, or just return user object
        // Usually better to return the updated user object. 
        // If we want to return the image usable immediately:
        const userObj = user.toObject();
        if (user.profileImage && user.profileImageType) {
            userObj.profileImage = `data:${user.profileImageType};base64,${user.profileImage.toString('base64')}`;
        }

        return NextResponse.json({ user: userObj });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
