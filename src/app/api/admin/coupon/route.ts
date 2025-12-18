import { requireAuth, ROLES } from '@/lib/auth';
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import InfluencerCoupon from '@/models/InfluencerCoupon';

// GET - List all influencer coupons
export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const coupons = await InfluencerCoupon.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: coupons });
    } catch (error: any) {
        console.error('Error in GET /api/admin/coupon:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Create new influencer coupon
export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const body = await req.json();
        const { code, discountAmount, usageLimit, expiryDate, createdBy } = body;

        // Check if code already exists
        const existing = await InfluencerCoupon.findOne({ code });
        if (existing) {
            return NextResponse.json({
                success: false,
                error: 'Coupon code already exists'
            }, { status: 400 });
        }

        const coupon = await InfluencerCoupon.create({
            code,
            discountAmount,
            usageLimit: usageLimit || null,
            expiryDate: expiryDate || null,
            createdBy,
            isActive: true,
            usedCount: 0
        });

        return NextResponse.json({ success: true, data: coupon }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH - Update coupon (activate/deactivate)
export async function PATCH(req: NextRequest) {
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const body = await req.json();
        const { id, isActive } = body;

        const coupon = await InfluencerCoupon.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!coupon) {
            return NextResponse.json({
                success: false,
                error: 'Coupon not found'
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: coupon });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
// PUT - Update coupon details
export async function PUT(req: NextRequest) {
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const body = await req.json();
        const { _id, ...updates } = body;

        const coupon = await InfluencerCoupon.findByIdAndUpdate(
            _id,
            updates,
            { new: true }
        );

        if (!coupon) {
            return NextResponse.json({
                success: false,
                error: 'Coupon not found'
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: coupon });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
