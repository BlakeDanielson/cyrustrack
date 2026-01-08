import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface VesselEntry {
  name: string;
  count: number;
}

interface CategoryData {
  category: string;
  count: number;
  vessels: VesselEntry[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const searchQuery = searchParams.get('q')?.toLowerCase() || '';

    // Get all sessions with their vessel data
    const sessions = await prisma.consumptionSession.findMany({
      select: { 
        vessel_category: true,
        vessel: true 
      }
    });

    if (category) {
      // Return vessels for a specific category
      const vesselCountMap = new Map<string, number>();

      for (const session of sessions) {
        if (session.vessel_category !== category) continue;
        if (!session.vessel || session.vessel.trim() === '') continue;
        
        const vessel = session.vessel.trim();
        const currentCount = vesselCountMap.get(vessel) || 0;
        vesselCountMap.set(vessel, currentCount + 1);
      }

      let entries: VesselEntry[] = Array.from(vesselCountMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      // Filter by search query if provided
      if (searchQuery) {
        entries = entries.filter(entry => 
          entry.name.toLowerCase().includes(searchQuery)
        );
      }

      return NextResponse.json({
        category,
        vessels: entries,
        total: entries.length,
        success: true
      });
    }

    // Return all categories with their vessel counts
    const categoryMap = new Map<string, { count: number; vessels: Map<string, number> }>();

    for (const session of sessions) {
      const cat = session.vessel_category || 'Other';
      const vessel = session.vessel?.trim() || 'Unknown';

      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, { count: 0, vessels: new Map() });
      }

      const catData = categoryMap.get(cat)!;
      catData.count++;
      
      const vesselCount = catData.vessels.get(vessel) || 0;
      catData.vessels.set(vessel, vesselCount + 1);
    }

    // Convert to array format
    const categories: CategoryData[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        vessels: Array.from(data.vessels.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      categories,
      total: sessions.length,
      success: true
    });
  } catch (error) {
    console.error('GET /api/sessions/vessels error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vessels', success: false },
      { status: 500 }
    );
  }
}
