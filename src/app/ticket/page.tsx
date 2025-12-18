import { getServerUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { generateQRCodeDataURL } from '@/lib/qrcode';
import { redirect } from 'next/navigation';

export default async function TicketPage() {
    const user = await getServerUser();

    if (!user) {
        redirect('/login');
    }

    await dbConnect();
    const ticket = await Ticket.findOne({ userId: user._id });

    if (!ticket) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-card border border-border p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold mb-4 text-foreground">No Ticket Found</h1>
                    <p className="text-muted-foreground mb-6">
                        We couldn't find a ticket associated with your account. Please register first.
                    </p>
                    <a href="/register/participant" className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90">
                        Register Now
                    </a>
                </div>
            </div>
        );
    }

    // Generate QR Code Image
    const qrCodeUrl = await generateQRCodeDataURL(ticket.qrCodeData, {
        size: 400,
        errorCorrectionLevel: 'H',
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
            <div className="bg-card border border-border p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Your Ticket</h1>
                    <p className="text-muted-foreground">Behind The Build 2024</p>
                </div>

                <div className="bg-white p-4 rounded-lg mb-6 inline-block">
                    <img src={qrCodeUrl} alt="Ticket QR Code" className="w-64 h-64" />
                </div>

                <div className="space-y-4 text-left mb-8">
                    <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium text-foreground">{user.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-muted-foreground">Role</span>
                        <span className="font-medium text-foreground">{user.role}</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-muted-foreground">Status</span>
                        <span className={`font-medium ${ticket.status === 'Valid' ? 'text-green-500' : 'text-red-500'}`}>
                            {ticket.status}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-muted-foreground">Ticket ID</span>
                        <span className="font-mono text-xs text-foreground">{ticket._id.toString().slice(-6).toUpperCase()}</span>
                    </div>
                </div>

                <div className="text-sm text-muted-foreground">
                    <p>Please show this QR code at the entrance.</p>
                </div>
            </div>
        </div>
    );
}
