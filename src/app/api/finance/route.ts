import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { MONGODB_URI } from '@/lib/mongodb';
import MonthlyFinance from '@/lib/models';
import { getStarterData } from '@/lib/initialData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthYear = searchParams.get('monthYear'); // e.g. "2026-06"

    if (!monthYear) {
      return NextResponse.json({ error: 'monthYear query parameter is required' }, { status: 400 });
    }

    // Check if database is configured
    if (!MONGODB_URI) {
      // In Local Mode (no MongoDB URI configured), let the client know
      return NextResponse.json({ 
        isLocalMode: true, 
        message: 'No MONGODB_URI configured. Running in Local Storage Mode.',
        data: getStarterData(monthYear)
      });
    }

    await dbConnect();
    
    let record = await MonthlyFinance.findOne({ monthYear });
    
    if (!record) {
      // Create a default record for this month if it doesn't exist
      const starter = getStarterData(monthYear);
      record = await MonthlyFinance.create(starter);
    }

    return NextResponse.json({ isLocalMode: false, data: record });
  } catch (error: any) {
    console.error('API GET Finance error:', error);
    
    // Fallback search parameters handling
    const url = new URL(request.url);
    const monthYear = url.searchParams.get('monthYear') || '2026-06';

    // If it's a connection error, gracefully switch to Local Mode rather than crashing
    return NextResponse.json({ 
      isLocalMode: true, 
      error: error.message,
      message: 'MongoDB connection failed. Falling back to Local Storage Mode.',
      data: getStarterData(monthYear)
    }, { status: 200 }); // We return 200 with isLocalMode so client can proceed
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { monthYear, income, categories, expenses, funds } = body;

    if (!monthYear) {
      return NextResponse.json({ error: 'monthYear is required' }, { status: 400 });
    }

    if (!MONGODB_URI) {
      return NextResponse.json({ 
        isLocalMode: true, 
        message: 'No MONGODB_URI configured. Running in Local Storage Mode.' 
      }, { status: 200 });
    }

    await dbConnect();

    // Upsert the record for the specific month-year
    const updatedRecord = await MonthlyFinance.findOneAndUpdate(
      { monthYear },
      { 
        monthYear, 
        income, 
        categories, 
        expenses, 
        funds 
      },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ isLocalMode: false, data: updatedRecord });
  } catch (error: any) {
    console.error('API POST Finance error:', error);
    return NextResponse.json({ 
      isLocalMode: true, 
      error: error.message,
      message: 'Failed to save to MongoDB. Save locally.'
    }, { status: 500 });
  }
}
