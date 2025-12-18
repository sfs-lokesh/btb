import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pitch from '@/models/Pitch';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  try {
    const body = await request.json();
    // Exclude voting fields from general purpose PUT
    const { upvotes, downvotes, ...updateData } = body;

    const updatedPitch = await Pitch.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPitch) {
      return NextResponse.json({ success: false, error: 'Pitch not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedPitch });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  try {
    const deletedPitch = await Pitch.deleteOne({ _id: id });
    if (deletedPitch.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Pitch not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
