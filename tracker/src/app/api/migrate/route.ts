import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';
import { storageService } from '@/lib/storage';
import { CreateConsumptionSession } from '@/types/consumption';

// POST /api/migrate - Migrate data from localStorage to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessions } = body;

    if (!sessions || !Array.isArray(sessions)) {
      return NextResponse.json(
        { error: 'Invalid sessions data provided', success: false },
        { status: 400 }
      );
    }

    // Validate sessions structure
    const validSessions: CreateConsumptionSession[] = [];
    const errors: string[] = [];

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      
      // Validate required fields
      const requiredFields = ['date', 'time', 'location', 'vessel', 'strain_name', 'quantity'];
      const missingFields = requiredFields.filter(field => !session[field]);
      
      if (missingFields.length > 0) {
        errors.push(`Session ${i + 1}: Missing fields - ${missingFields.join(', ')}`);
        continue;
      }

      // Convert to CreateConsumptionSession format (remove id, created_at, updated_at)
      const { id, created_at, updated_at, ...sessionData } = session;
      validSessions.push(sessionData as CreateConsumptionSession);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Some sessions have validation errors',
          details: errors,
          success: false 
        },
        { status: 400 }
      );
    }

    // Create sessions in database
    const createdCount = await databaseService.createMany(validSessions);

    return NextResponse.json({
      message: `Successfully migrated ${createdCount} sessions to database`,
      migrated: createdCount,
      total: sessions.length,
      success: true
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate sessions', success: false },
      { status: 500 }
    );
  }
}

// GET /api/migrate - Get localStorage data for migration
export async function GET() {
  try {
    // This endpoint can be used to fetch localStorage data server-side if needed
    return NextResponse.json({
      message: 'Use the client-side migration utility to transfer localStorage data',
      endpoint: 'POST /api/migrate',
      success: true
    });
  } catch (error) {
    console.error('Migration GET error:', error);
    return NextResponse.json(
      { error: 'Migration endpoint error', success: false },
      { status: 500 }
    );
  }
}
