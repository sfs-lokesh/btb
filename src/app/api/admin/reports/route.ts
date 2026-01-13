import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import College from '@/models/College';
import Ticket from '@/models/Ticket';
import { exportToCSV, exportToExcel } from '@/lib/export';

import { requireAuth, ROLES } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        const auth = await requireAuth(req, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
        if (auth instanceof NextResponse) return auth;

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type'); // 'master' or 'college'
        const collegeId = searchParams.get('collegeId');
        const format = searchParams.get('format'); // 'json', 'csv', 'excel'

        let data: any[] = [];
        let filename = 'report';

        if (type === 'master') {
            data = await User.find({}).populate('collegeId').lean();
            filename = 'master-report';
        } else if (type === 'college') {
            if (!collegeId) {
                // Return summary of all colleges
                data = await College.find({}).lean();
                filename = 'colleges-summary';
            } else {
                // Return users for specific college
                data = await User.find({ collegeId }).populate('collegeId').lean();
                const college = await College.findById(collegeId);
                filename = `${college?.name || 'college'}-report`;
            }
        } else if (type === 'settlement') {
            const colleges = await College.find({}).lean();
            data = colleges.map((c: any) => ({
                ...c,
                pendingAmount: (c.earnings || 0) - (c.paidAmount || 0)
            }));
            filename = 'settlement-report';
        } else if (type === 'coupons') {
            data = await User.find({ couponUsed: { $ne: null } }).select('name email couponUsed').lean();
            filename = 'coupons-used-report';
        } else if (type === 'qr') {
            const tickets = await Ticket.find({}).populate('userId', 'name email').populate('scannedBy', 'name').lean();
            data = tickets.map((t: any) => ({
                ticketId: t._id,
                userName: t.userId?.name || 'Unknown',
                userEmail: t.userId?.email || 'Unknown',
                status: t.status,
                qrCode: t.qrCodeData,
                scannedAt: t.scannedAt ? new Date(t.scannedAt).toLocaleString() : 'Not Scanned',
                scannedBy: t.scannedBy?.name || '-'
            }));
            filename = 'qr-scan-report';
        } else {
            return NextResponse.json({ message: 'Invalid report type' }, { status: 400 });
        }

        // Process data for export (flatten objects)
        const processedData = data.map((item: any) => {
            const flatItem: any = { ...item };

            // Flatten college data
            if (item.collegeId && typeof item.collegeId === 'object') {
                flatItem.collegeName = item.collegeId.name;
                flatItem.collegeCode = item.collegeId.code;
                delete flatItem.collegeId;
            }

            // Format dates
            if (item.createdAt) flatItem.createdAt = new Date(item.createdAt).toLocaleString();
            if (item.updatedAt) flatItem.updatedAt = new Date(item.updatedAt).toLocaleString();

            return flatItem;
        });

        // Handle Export Formats
        if (format === 'csv') {
            const csv = exportToCSV(processedData);
            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${filename}.csv"`
                }
            });
        } else if (format === 'excel') {
            const buffer = await exportToExcel({ [filename]: processedData });
            return new NextResponse(new Blob([buffer as any]), {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="${filename}.xlsx"`
                }
            });
        }

        // Default JSON response
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Error in GET /api/admin/reports:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
