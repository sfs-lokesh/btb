import { jsPDF } from 'jspdf';
import { generateQRCodeDataURL } from './qrcode';

interface TicketData {
    ticketId: string;
    name: string;
    email: string;
    role: string;
    qrCodeData: string;
    price?: number;
    eventName?: string;
    eventDate?: string;
}

export async function generateTicketPDF(data: TicketData): Promise<Buffer> {
    // Create a new PDF document
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Header
    doc.setTextColor(68, 68, 68);
    doc.setFontSize(20);
    doc.text(data.eventName || 'Behind The Build 2024', 110, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(data.eventDate || 'February 15, 2025', 110, 25, { align: 'center' });

    // Divider
    doc.setDrawColor(170, 170, 170);
    doc.line(20, 30, 190, 30);

    // Ticket Title
    doc.setFontSize(25);
    doc.text('OFFICIAL ENTRY PASS', 105, 45, { align: 'center' });

    // Attendee Details
    doc.setFontSize(14);
    doc.text(`Name: ${data.name}`, 20, 65);
    doc.text(`Email: ${data.email}`, 20, 75);
    doc.text(`Role: ${data.role}`, 20, 85);
    doc.text(`Ticket ID: ${data.ticketId}`, 20, 95);

    if (data.price !== undefined) {
        doc.text(`Price Paid: ₹${data.price}`, 20, 105);
    }

    // QR Code
    // jsPDF addImage supports Data URL
    const qrDataUrl = await generateQRCodeDataURL(data.qrCodeData);
    doc.addImage(qrDataUrl, 'PNG', 70, 120, 70, 70);

    doc.setFontSize(10);
    doc.text('Scan this QR code at the entrance.', 105, 200, { align: 'center' });

    // Footer
    doc.text(
        'Please bring a valid ID proof along with this ticket.',
        105,
        250,
        { align: 'center' }
    );

    // Return as Buffer
    // jsPDF output('arraybuffer') returns ArrayBuffer, we need Buffer
    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
}
