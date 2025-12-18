import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Stall from '@/models/Stall';

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { name, location, category, price } = await req.json();
        const stall = await Stall.create({ name, location, category, price });
        return NextResponse.json(stall, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
