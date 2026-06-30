import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET() {
  const imagePath = "C:\\Users\\BusinessComputers.in\\.gemini\\antigravity-ide\\brain\\079458e2-fb3f-4047-817b-5389bc4da318\\models_bg_1782805940893.png";
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    return new NextResponse(fileBuffer, {
      headers: { 
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Image not found', { status: 404 });
  }
}
