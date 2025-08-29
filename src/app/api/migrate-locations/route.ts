import { NextResponse } from 'next/server';
import { migrateSessionLocations, backfillLocationCoordinates } from '@/lib/locationMigration';

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'migrate':
        const migrationResult = await migrateSessionLocations();
        return NextResponse.json({
          success: true,
          message: `Successfully migrated ${migrationResult.migrated} sessions to use normalized locations`,
          ...migrationResult
        });
        
      case 'backfill':
        const backfillResult = await backfillLocationCoordinates();
        return NextResponse.json({
          success: true,
          message: `Successfully updated coordinates for ${backfillResult.updated} locations`,
          ...backfillResult
        });
        
      case 'both':
        const migrate = await migrateSessionLocations();
        const backfill = await backfillLocationCoordinates();
        return NextResponse.json({
          success: true,
          message: `Migration complete: ${migrate.migrated} sessions migrated, ${backfill.updated} coordinates updated`,
          migration: migrate,
          backfill: backfill
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: migrate, backfill, or both' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Location migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Location Migration API',
    endpoints: {
      'POST /api/migrate-locations': {
        description: 'Migrate sessions to use normalized locations table',
        actions: {
          migrate: 'Create locations from existing session data',
          backfill: 'Add coordinates to locations missing them',
          both: 'Run both migration and backfill'
        }
      }
    },
    example: {
      method: 'POST',
      body: { action: 'both' }
    }
  });
}
