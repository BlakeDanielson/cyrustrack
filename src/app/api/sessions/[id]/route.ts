import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';
import { CreateConsumptionSession } from '@/types/consumption';

// GET /api/sessions/[id] - Get a specific session
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required', success: false },
        { status: 400 }
      );
    }

    const session = await databaseService.getById(id);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      session,
      success: true
    });
  } catch (error) {
    console.error('GET /api/sessions/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session', success: false },
      { status: 500 }
    );
  }
}

// PUT /api/sessions/[id] - Update a specific session
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required', success: false },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Prepare update data - only include fields that are provided
    const updates: Partial<CreateConsumptionSession> = {};
    
    if (body.date !== undefined) updates.date = body.date;
    if (body.time !== undefined) updates.time = body.time;
    if (body.location !== undefined) updates.location = body.location;
    if (body.latitude !== undefined) updates.latitude = body.latitude;
    if (body.longitude !== undefined) updates.longitude = body.longitude;
    if (body.who_with !== undefined) updates.who_with = body.who_with;
    if (body.vessel !== undefined) updates.vessel = body.vessel;
    if (body.accessory_used !== undefined) updates.accessory_used = body.accessory_used;
    if (body.my_vessel !== undefined) updates.my_vessel = body.my_vessel;
    if (body.my_substance !== undefined) updates.my_substance = body.my_substance;
    if (body.strain_name !== undefined) updates.strain_name = body.strain_name;
    if (body.thc_percentage !== undefined) updates.thc_percentage = body.thc_percentage;
    if (body.purchased_legally !== undefined) updates.purchased_legally = body.purchased_legally;
    if (body.state_purchased !== undefined) updates.state_purchased = body.state_purchased;
    if (body.tobacco !== undefined) updates.tobacco = body.tobacco;
    if (body.kief !== undefined) updates.kief = body.kief;
    if (body.concentrate !== undefined) updates.concentrate = body.concentrate;
    if (body.quantity !== undefined) updates.quantity = body.quantity;
    if (body.quantity_legacy !== undefined) updates.quantity_legacy = body.quantity_legacy;

    const updatedSession = await databaseService.update(id, updates);
    
    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Session not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      session: updatedSession,
      success: true
    });
  } catch (error) {
    console.error('PUT /api/sessions/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update session', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id] - Delete a specific session
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required', success: false },
        { status: 400 }
      );
    }

    const success = await databaseService.delete(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Session not found or failed to delete', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Session deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('DELETE /api/sessions/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session', success: false },
      { status: 500 }
    );
  }
}
