import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import College from '@/models/College';

export async function GET() {
    await dbConnect();

    try {
        // Get all colleges
        const colleges = await College.find({}).lean();

        // Update each college to fix the registrations field
        for (const college of colleges) {
            await College.updateOne(
                { _id: college._id },
                {
                    $set: {
                        registrations: Array.isArray(college.registrations)
                            ? college.registrations.length
                            : 0
                    }
                }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Migrated ${colleges.length} colleges`,
            colleges: await College.find({})
        });
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
