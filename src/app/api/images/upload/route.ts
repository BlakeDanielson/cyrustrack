import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true, // Prevents filename conflicts
    });

    // For temporary sessions (like 'temp'), we'll store the image with a temporary session ID
    // These can be linked to actual sessions later
    const actualSessionId = sessionId === 'temp' ? `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : sessionId;

    // Save image metadata to database
    const image = await prisma.image.create({
      data: {
        session_id: actualSessionId,
        blob_url: blob.url,
        filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        width: undefined, // We'll implement proper dimension extraction later
        height: undefined,
      },
    });

    return NextResponse.json({
      success: true,
      image: {
        id: image.id,
        session_id: image.session_id,
        blob_url: image.blob_url,
        filename: image.filename,
        file_size: image.file_size,
        mime_type: image.mime_type,
        width: image.width,
        height: image.height,
        created_at: image.created_at,
      },
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Get image info before deletion
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete from database (this will cascade to the blob storage cleanup)
    await prisma.image.delete({
      where: { id: imageId },
    });

    // Note: Vercel Blob automatically cleans up orphaned files
    // You could implement manual cleanup if needed

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

// New endpoint to link temporary images to actual sessions
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tempSessionId = searchParams.get('tempSessionId');
    const actualSessionId = searchParams.get('actualSessionId');

    if (!tempSessionId || !actualSessionId) {
      return NextResponse.json(
        { error: 'Both tempSessionId and actualSessionId are required' },
        { status: 400 }
      );
    }

    // Update all images with the temporary session ID to use the actual session ID
    const updatedImages = await prisma.image.updateMany({
      where: {
        session_id: tempSessionId,
      },
      data: {
        session_id: actualSessionId,
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: updatedImages.count,
    });

  } catch (error) {
    console.error('Image linking error:', error);
    return NextResponse.json(
      { error: 'Failed to link images to session' },
      { status: 500 }
    );
  }
}
