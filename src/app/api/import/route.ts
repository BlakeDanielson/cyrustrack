import { NextRequest, NextResponse } from 'next/server';
import { importCSVSessions, validateCSVFormat } from '@/lib/csvImport';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { csvContent, validate = false } = body;

    if (!csvContent || typeof csvContent !== 'string') {
      return NextResponse.json(
        { error: 'CSV content is required' },
        { status: 400 }
      );
    }

    // If just validating, return validation result
    if (validate) {
      const validation = validateCSVFormat(csvContent);
      return NextResponse.json(validation);
    }

    // Otherwise, perform the import
    const result = await importCSVSessions(csvContent);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${result.imported} sessions`,
        imported: result.imported
      });
    } else {
      return NextResponse.json({
        success: false,
        errors: result.errors
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during import' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'CSV Import API',
    endpoints: {
      'POST /api/import': 'Import CSV data',
      'POST /api/import?validate=true': 'Validate CSV format'
    },
    csvFormat: {
      required_headers: [
        'Instance (Blake Tracking)',
        'When',
        'Location', 
        'Vessel',
        'Strain',
        'Quantity'
      ],
      optional_headers: [
        'City', 'State', 'Alone?', 'People', 'Accessory Used',
        'Your Vessel', 'Your Substance', 'Type', 'THC %',
        'Legal Product_Purchased?', 'State Purchased?',
        'Tobacco', 'Kief', 'Concentrate', 'Lavendar', 'Comments'
      ],
      separator: 'Tab-separated values'
    }
  });
}
