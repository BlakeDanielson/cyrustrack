import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';
import { SessionImage } from '@/types/consumption';

// GET /api/feedback - Get all feedback entries
export async function GET() {
  try {
    const feedbackEntries = await databaseService.getFeedbackEntries();

    return NextResponse.json({
      feedbackEntries,
      count: feedbackEntries.length,
      success: true,
    });
  } catch (error) {
    console.error('GET /api/feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback entries', success: false },
      { status: 500 }
    );
  }
}

// POST /api/feedback - Create a feedback entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!content) {
      return NextResponse.json(
        { error: 'Feedback content is required', success: false },
        { status: 400 }
      );
    }

    const images = Array.isArray(body.images) ? (body.images as SessionImage[]) : undefined;
    const feedbackEntry = await databaseService.createFeedbackEntry(content, images);

    return NextResponse.json(
      {
        feedbackEntry,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback entry', success: false },
      { status: 500 }
    );
  }
}
