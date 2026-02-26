import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';
import { CreateConsumptionSession } from '@/types/consumption';

// GET /api/sessions - Get all sessions or filtered sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filter parameters
    const filters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      strainName: searchParams.get('strainName') || undefined,
      location: searchParams.get('location') || undefined,
      vessel: searchParams.get('vessel') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    // Check if any filters are applied
    const hasFilters = Object.values(filters).some(value => value !== undefined);
    
    const sessions = hasFilters 
      ? await databaseService.getFiltered(filters)
      : await databaseService.getAll();

    return NextResponse.json({
      sessions,
      count: sessions.length,
      success: true
    });
  } catch (error) {
    console.error('GET /api/sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions', success: false },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['date', 'time', 'location', 'vessel_category', 'vessel', 'strain_name', 'quantity'];
    const missingFields = requiredFields.filter(field => !body[field]);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/3931dac6-182e-4a91-bd6e-d62afaa24791',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ac4157'},body:JSON.stringify({sessionId:'ac4157',runId:'initial',hypothesisId:'H3',location:'src/app/api/sessions/route.ts:51',message:'POST sessions required-field validation',data:{requiredFields,missingFields,quantity:body.quantity,quantityType:typeof body.quantity,my_vessel:body.my_vessel,my_substance:body.my_substance,purchased_legally:body.purchased_legally},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`, 
          success: false 
        },
        { status: 400 }
      );
    }

    const sessionData: CreateConsumptionSession = {
      date: body.date,
      time: body.time,
      location: body.location,
      latitude: body.latitude,
      longitude: body.longitude,
      who_with: body.who_with || '',
      vessel_category: body.vessel_category,
      vessel: body.vessel,
      accessory_used: body.accessory_used || 'N/A',
      my_vessel: body.my_vessel ?? true,
      my_substance: body.my_substance ?? true,
      strain_name: body.strain_name,
      strain_type: body.strain_type,
      thc_percentage: body.thc_percentage,
      purchased_legally: body.purchased_legally ?? true,
      state_purchased: body.state_purchased,
      tobacco: body.tobacco || undefined,
      kief: body.kief ?? false,
      concentrate: body.concentrate ?? false,
      lavender: body.lavender ?? false,
      quantity: body.quantity,
      quantity_legacy: body.quantity_legacy,
      comments: body.comments || undefined,
      selectedLocationId: body.selectedLocationId,
    };

    const newSession = await databaseService.create(sessionData);

    return NextResponse.json({
      session: newSession,
      success: true
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to create session', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions - Clear all sessions (for admin/testing)
export async function DELETE() {
  try {
    await databaseService.clear();
    return NextResponse.json({
      message: 'All sessions deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('DELETE /api/sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to delete sessions', success: false },
      { status: 500 }
    );
  }
}
