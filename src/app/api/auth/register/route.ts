
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const { name, email, password, role, phone, college, domain, teamName, teamMembers, projectDescription } = body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: 'Name, email, password, and role are required fields.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 409 });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      college,
      domain,
      teamName,
      teamMembers,
      projectDescription
    });

    // Don't send password back
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return NextResponse.json({ success: true, data: userResponse }, { status: 201 });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
