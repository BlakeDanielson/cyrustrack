import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';
import { SessionImage } from '@/types/consumption';

// PUT /api/feedback/[id] - Update a feedback entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID is required', success: false },
        { status: 400 }
      );
    }

    const body = await request.json();
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!content) {
      return NextResponse.json(
        { error: 'Feedback content is required', success: false },
        { status: 400 }
      );
    }

    const images = Array.isArray(body.images) ? (body.images as SessionImage[]) : undefined;
    const updatedEntry = await databaseService.updateFeedbackEntry(id, content, images);

    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Feedback entry not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      feedbackEntry: updatedEntry,
      success: true,
    });
  } catch (error) {
    console.error('PUT /api/feedback/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback entry', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/feedback/[id] - Delete a feedback entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID is required', success: false },
        { status: 400 }
      );
    }

    const deleted = await databaseService.deleteFeedbackEntry(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Feedback entry not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback entry deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/feedback/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete feedback entry', success: false },
      { status: 500 }
    );
  }
}
