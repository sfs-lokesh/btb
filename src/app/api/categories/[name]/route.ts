import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Pitch from '@/models/Pitch';

export async function DELETE(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  await dbConnect();
  try {
    // Optional: Prevent deletion if pitches are using this category
    const pitchesInCategory = await Pitch.find({ category: name });
    if (pitchesInCategory.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category: it is currently in use by pitches.' },
        { status: 400 }
      );
    }

    const decodedName = decodeURIComponent(name);
    const deletedCategory = await Category.deleteOne({ name: decodedName });
    if (deletedCategory.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
