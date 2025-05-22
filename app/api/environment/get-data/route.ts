import { NextRequest, NextResponse } from 'next/server';
import pb from '@/lib/pocketbase';
import { EnvironmentalData } from '@/types/index';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const dataType = searchParams.get('dataType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build filter conditions
    const filterConditions: string[] = [];

    if (dataType && ['pollution', 'biodiversity', 'weather'].includes(dataType)) {
      filterConditions.push(`dataType = "${dataType}"`);
    }

    if (startDate) {
      filterConditions.push(`created >= "${startDate}"`);
    }

    if (endDate) {
      filterConditions.push(`created <= "${endDate}"`);
    }

    const filter = filterConditions.length > 0 ? filterConditions.join(' && ') : '';

    // Get data from PocketBase
    const records = await pb.collection('environmental_data').getList(page, limit, {
      sort: '-created',
      filter: filter || undefined,
    });

    return NextResponse.json({
      success: true,
      data: records.items as unknown as EnvironmentalData[],
      page: records.page,
      perPage: records.perPage,
      totalItems: records.totalItems,
      totalPages: records.totalPages
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch data',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}