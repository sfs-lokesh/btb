import QRCode from 'qrcode';

export interface QRCodeOptions {
    size?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    margin?: number;
    color?: {
        dark?: string;
        light?: string;
    };
}

/**
 * Generate QR code as a data URL (base64)
 * @param data - Data to encode in QR code
 * @param options - QR code generation options
 * @returns Base64 data URL of the QR code image
 */
export async function generateQRCodeDataURL(
    data: string,
    options: QRCodeOptions = {}
): Promise<string> {
    const {
        size = 300,
        errorCorrectionLevel = 'M',
        margin = 4,
        color = { dark: '#000000', light: '#FFFFFF' }
    } = options;

    try {
        const dataURL = await QRCode.toDataURL(data, {
            width: size,
            errorCorrectionLevel,
            margin,
            color
        });
        return dataURL;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
}

/**
 * Generate QR code as a buffer (for email attachments)
 * @param data - Data to encode in QR code
 * @param options - QR code generation options
 * @returns Buffer containing PNG image data
 */
export async function generateQRCodeBuffer(
    data: string,
    options: QRCodeOptions = {}
): Promise<Buffer> {
    const {
        size = 300,
        errorCorrectionLevel = 'M',
        margin = 4,
        color = { dark: '#000000', light: '#FFFFFF' }
    } = options;

    try {
        const buffer = await QRCode.toBuffer(data, {
            width: size,
            errorCorrectionLevel,
            margin,
            color,
            type: 'png'
        });
        return buffer;
    } catch (error) {
        console.error('Error generating QR code buffer:', error);
        throw new Error('Failed to generate QR code buffer');
    }
}

/**
 * Generate QR code as SVG string
 * @param data - Data to encode in QR code
 * @param options - QR code generation options
 * @returns SVG string
 */
export async function generateQRCodeSVG(
    data: string,
    options: QRCodeOptions = {}
): Promise<string> {
    const {
        size = 300,
        errorCorrectionLevel = 'M',
        margin = 4,
        color = { dark: '#000000', light: '#FFFFFF' }
    } = options;

    try {
        const svg = await QRCode.toString(data, {
            type: 'svg',
            width: size,
            errorCorrectionLevel,
            margin,
            color
        });
        return svg;
    } catch (error) {
        console.error('Error generating QR code SVG:', error);
        throw new Error('Failed to generate QR code SVG');
    }
}

/**
 * Generate ticket QR code with event branding
 * @param ticketId - Unique ticket identifier
 * @param userId - User ID
 * @returns QR code data URL with branding
 */
export async function generateTicketQRCode(
    ticketId: string,
    userId: string
): Promise<string> {
    // Create a JSON payload with ticket information
    const qrData = JSON.stringify({
        ticketId,
        userId,
        event: 'Behind The Build 2024',
        timestamp: new Date().toISOString()
    });

    // Generate QR code with custom branding colors
    return generateQRCodeDataURL(qrData, {
        size: 400,
        errorCorrectionLevel: 'H', // High error correction for better scanning
        color: {
            dark: '#1a1a1a',
            light: '#ffffff'
        }
    });
}

/**
 * Generate ticket QR code buffer for email attachment
 * @param ticketId - Unique ticket identifier
 * @param userId - User ID
 * @returns QR code buffer
 */
export async function generateTicketQRCodeBuffer(
    ticketId: string,
    userId: string
): Promise<Buffer> {
    const qrData = JSON.stringify({
        ticketId,
        userId,
        event: 'Behind The Build 2024',
        timestamp: new Date().toISOString()
    });

    return generateQRCodeBuffer(qrData, {
        size: 400,
        errorCorrectionLevel: 'H',
        color: {
            dark: '#1a1a1a',
            light: '#ffffff'
        }
    });
}
