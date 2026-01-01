// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Check for missing environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Cloudinary environment variables are missing');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    // Convert file to buffer and then to a base64 data URI
    const fileBuffer = await file.arrayBuffer();
    const mimeType = file.type;
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    // Upload the data URI to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'pitchrate',
      resource_type: 'image',
    });

    return NextResponse.json({ success: true, url: result.secure_url });

  } catch (error: any) {
    console.error('Upload API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
