import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SponsorRequest from '@/models/SponsorRequest';
import { getCurrentUser } from '@/lib/auth';


export async function POST(req: Request) {
    await dbConnect();

    try {
        const contentType = req.headers.get('content-type') || '';
        let data: any = {};

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('logo') as File | null;

            if (file && file.size > 0) {
                const bytes = await file.arrayBuffer();
                data.logoBuffer = Buffer.from(bytes);
                data.logoType = file.type;
            }

            data.name = formData.get('name');
            data.businessName = formData.get('businessName');
            data.email = formData.get('email');
            data.phone = formData.get('phone');
        } else {
            data = await req.json();
        }

        const { name, businessName, email, phone } = data;

        if (!name || !businessName || !email || !phone) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const newRequest = await SponsorRequest.create(data);

        return NextResponse.json({ success: true, message: 'Request submitted successfully', data: newRequest }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        const user = await getCurrentUser(req);
        if (!user || !['Admin', 'SuperAdmin'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const requests = await SponsorRequest.find().sort({ createdAt: -1 });

        const transformed = requests.map(r => {
            const obj = r.toObject();
            if (r.logoBuffer && r.logoType) {
                obj.logo = `data:${r.logoType};base64,${r.logoBuffer.toString('base64')}`;
            }
            delete obj.logoBuffer;
            return obj;
        });

        return NextResponse.json(transformed);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

