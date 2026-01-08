import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface WhoWithEntry {
  name: string;
  count: number;
}

// GET /api/sessions/who-with - Get unique "who with" names from all sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q')?.toLowerCase() || '';

    // Fetch all who_with values from sessions
    const sessions = await prisma.consumptionSession.findMany({
      select: {
        who_with: true
      }
    });

    // Parse semicolon-delimited names and count occurrences
    const nameCountMap = new Map<string, number>();

    for (const session of sessions) {
      if (!session.who_with || session.who_with.trim() === '') {
        continue;
      }

      // Split by semicolon and process each name
      const names = session.who_with.split(';');
      
      for (const rawName of names) {
        const name = rawName.trim();
        
        // Skip empty names
        if (!name) {
          continue;
        }

        // Increment count for this name
        const currentCount = nameCountMap.get(name) || 0;
        nameCountMap.set(name, currentCount + 1);
      }
    }

    // Convert to array and sort by count (most frequent first)
    let entries: WhoWithEntry[] = Array.from(nameCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Filter by search query if provided
    if (searchQuery) {
      entries = entries.filter(entry => 
        entry.name.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      names: entries,
      total: entries.length,
      success: true
    });
  } catch (error) {
    console.error('GET /api/sessions/who-with error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch who-with names', success: false },
      { status: 500 }
    );
  }
}
