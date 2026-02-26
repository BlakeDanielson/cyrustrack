import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface AccessoryEntry {
  name: string;
  count: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q')?.toLowerCase() || '';
    const vesselFilter = searchParams.get('vessel') || '';
    const vesselCategoryFilter = searchParams.get('vesselCategory') || '';

    // Build the query filter
    const whereClause: Prisma.ConsumptionSessionWhereInput = {};
    if (vesselFilter) {
      whereClause.vessel = {
        equals: vesselFilter,
        mode: 'insensitive',
      };
    }
    if (vesselCategoryFilter) {
      whereClause.vessel_category = {
        equals: vesselCategoryFilter,
        mode: 'insensitive',
      };
    }

    // Get sessions with their accessories, optionally filtered by vessel
    const sessions = await prisma.consumptionSession.findMany({
      where: whereClause,
      select: { accessory_used: true }
    });

    // Count occurrences of each accessory
    const accessoryCountMap = new Map<string, number>();

    for (const session of sessions) {
      if (!session.accessory_used || session.accessory_used.trim() === '') {
        continue;
      }
      
      const accessory = session.accessory_used.trim();
      const currentCount = accessoryCountMap.get(accessory) || 0;
      accessoryCountMap.set(accessory, currentCount + 1);
    }

    // Convert to array and sort by usage count
    let entries: AccessoryEntry[] = Array.from(accessoryCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Filter by search query if provided
    if (searchQuery) {
      entries = entries.filter(entry => 
        entry.name.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      accessories: entries,
      total: entries.length,
      vessel: vesselFilter || null,
      vesselCategory: vesselCategoryFilter || null,
      success: true
    });
  } catch (error) {
    console.error('GET /api/sessions/accessories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accessories', success: false },
      { status: 500 }
    );
  }
}
