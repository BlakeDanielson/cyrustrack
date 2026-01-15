import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface TobaccoEntry {
  name: string;
  count: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q')?.toLowerCase() || '';

    // Get all sessions with tobacco values
    const sessions = await prisma.consumptionSession.findMany({
      select: { tobacco: true }
    });

    // Count occurrences of each tobacco type
    const tobaccoCountMap = new Map<string, number>();

    for (const session of sessions) {
      // Skip null, empty, or "None" values
      if (!session.tobacco || session.tobacco.trim() === '' || session.tobacco === 'None') {
        continue;
      }
      
      const tobacco = session.tobacco.trim();
      const currentCount = tobaccoCountMap.get(tobacco) || 0;
      tobaccoCountMap.set(tobacco, currentCount + 1);
    }

    // Convert to array and sort by usage count
    let entries: TobaccoEntry[] = Array.from(tobaccoCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Filter by search query if provided
    if (searchQuery) {
      entries = entries.filter(entry => 
        entry.name.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      tobaccoTypes: entries,
      total: entries.length,
      success: true
    });
  } catch (error) {
    console.error('GET /api/sessions/tobacco error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tobacco types', success: false },
      { status: 500 }
    );
  }
}
