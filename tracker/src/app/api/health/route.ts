import { NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';

// GET /api/health - Health check for database and services
export async function GET() {
  try {
    const dbHealthy = await databaseService.healthCheck();
    const sessionCount = await databaseService.count();
    
    return NextResponse.json({
      status: 'healthy',
      database: dbHealthy ? 'connected' : 'disconnected',
      sessionCount,
      timestamp: new Date().toISOString(),
      success: true
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'error',
        error: 'Database connection failed',
        timestamp: new Date().toISOString(),
        success: false
      },
      { status: 500 }
    );
  }
}
