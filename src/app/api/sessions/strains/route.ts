import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface StrainEntry {
  name: string;
  count: number;
  lastUsed: string;
}

const normalizeForSearch = (value: string) => value.toLowerCase().replace(/\s+/g, '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = normalizeForSearch(searchParams.get('q') || '');
    const vesselFilter = (searchParams.get('vessel') || '').trim();
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Get all sessions with strain names, ordered by most recent first
    const sessions = await prisma.consumptionSession.findMany({
      ...(vesselFilter
        ? {
            where: {
              vessel: {
                equals: vesselFilter,
                mode: 'insensitive',
              },
            },
          }
        : {}),
      select: { 
        strain_name: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Track unique strains with count and last used date
    const strainMap = new Map<string, { count: number; lastUsed: Date }>();

    for (const session of sessions) {
      // Skip null or empty strain names
      if (!session.strain_name || session.strain_name.trim() === '') {
        continue;
      }
      
      const strainName = session.strain_name.trim();
      const existing = strainMap.get(strainName);
      
      if (existing) {
        existing.count += 1;
        // Keep the most recent date
        if (session.created_at > existing.lastUsed) {
          existing.lastUsed = session.created_at;
        }
      } else {
        strainMap.set(strainName, {
          count: 1,
          lastUsed: session.created_at
        });
      }
    }

    // Convert to array and sort by last used (most recent first)
    let entries: StrainEntry[] = Array.from(strainMap.entries())
      .map(([name, data]) => ({ 
        name, 
        count: data.count,
        lastUsed: data.lastUsed.toISOString()
      }))
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());

    // Filter by search query if provided
    if (searchQuery) {
      entries = entries.filter(entry => 
        normalizeForSearch(entry.name).includes(searchQuery)
      );
    }

    // Limit results
    entries = entries.slice(0, limit);

    return NextResponse.json({
      strains: entries,
      total: entries.length,
      success: true
    });
  } catch (error) {
    console.error('GET /api/sessions/strains error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch strain names', success: false },
      { status: 500 }
    );
  }
}
