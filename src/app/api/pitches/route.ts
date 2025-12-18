import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pitch from '@/models/Pitch';

export async function GET() {
  await dbConnect();
  try {
    const pitches = await Pitch.find({});
    return NextResponse.json({ success: true, data: pitches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const pitch = await Pitch.create(body);
    return NextResponse.json({ success: true, data: pitch }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
