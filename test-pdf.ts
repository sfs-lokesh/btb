import { generateTicketPDF } from './src/lib/pdf';
import fs from 'fs';

async function testPDF() {
    try {
        console.log('Generating PDF...');
        const pdfBuffer = await generateTicketPDF({
            ticketId: 'TICKET-123456',
            name: 'Test User',
            email: 'test@example.com',
            role: 'Participant',
            qrCodeData: 'USER-123-TIMESTAMP',
            price: 1600
        });

        fs.writeFileSync('test-ticket.pdf', pdfBuffer);
        console.log('✅ PDF generated successfully: test-ticket.pdf');
    } catch (error) {
        console.error('❌ PDF generation failed:', error);
    }
}

testPDF();
