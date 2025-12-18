import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Pitch from '@/models/Pitch';

export async function GET() {
  await dbConnect();
  try {
    let categories = await Category.find({});
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Web Development' },
        { name: '3D Animation' },
        { name: 'Video Editing' },
        { name: 'VFX' },
      ];
      await Category.insertMany(defaultCategories);
      categories = await Category.find({});
    }
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const category = await Category.create({ name: body.name });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
