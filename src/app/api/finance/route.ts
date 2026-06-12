import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect, { MONGODB_URI } from '@/lib/mongodb';
import MonthlyFinance from '@/lib/models';
import { getStarterData } from '@/lib/initialData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthYear = searchParams.get('monthYear'); // e.g. "2026-06"
    const username = searchParams.get('username')?.trim().toLowerCase();

    if (!monthYear || !username) {
      return NextResponse.json({ error: 'monthYear and username query parameters are required' }, { status: 400 });
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

    // Connected Mode: Verify HTTP-only cookie to authenticate request username
    const cookieStore = await cookies();
    const authUser = cookieStore.get('auth_user')?.value;
    if (!authUser || authUser !== username) {
      return NextResponse.json({ error: 'Unauthorized access. Authentication is required.' }, { status: 401 });
    }

    await dbConnect();
    
    let record = await MonthlyFinance.findOne({ username, monthYear });
    
    if (!record) {
      // Find the most recent record before this month to copy categories, income, and funds from
      const prevRecords = await MonthlyFinance.find({
        username,
        monthYear: { $lt: monthYear }
      })
      .sort({ monthYear: -1 })
      .limit(1);

      const prevRecord = prevRecords.length > 0 ? prevRecords[0] : null;

      let starter;
      if (prevRecord) {
        const copiedCategories = prevRecord.categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          budget: c.budget,
          type: c.type,
          color: c.color
        }));

        const copiedFunds = prevRecord.funds ? prevRecord.funds.map((f: any) => ({
          id: f.id,
          name: f.name,
          target: f.target,
          current: f.current
        })) : [];

        starter = {
          username,
          monthYear,
          income: prevRecord.income,
          categories: copiedCategories,
          expenses: [], // new month starts with empty expenses
          funds: copiedFunds
        };
      } else {
        // Create a default record for this month if no previous record exists
        starter = { ...getStarterData(monthYear), username };
      }

      record = await MonthlyFinance.create(starter);
    }

    return NextResponse.json({ isLocalMode: false, data: record }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
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
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }); // We return 200 with isLocalMode so client can proceed
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, monthYear, income, categories, expenses, funds } = body;

    if (!monthYear || !username) {
      return NextResponse.json({ error: 'monthYear and username are required' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    if (!MONGODB_URI) {
      return NextResponse.json({ 
        isLocalMode: true, 
        message: 'No MONGODB_URI configured. Running in Local Storage Mode.' 
      }, { status: 200 });
    }

    // Connected Mode: Verify HTTP-only cookie matches body username
    const cookieStore = await cookies();
    const authUser = cookieStore.get('auth_user')?.value;
    if (!authUser || authUser !== cleanUsername) {
      return NextResponse.json({ error: 'Unauthorized access. Authentication is required.' }, { status: 401 });
    }

    await dbConnect();

    // Upsert the record for the specific username and month-year
    const updatedRecord = await MonthlyFinance.findOneAndUpdate(
      { username: cleanUsername, monthYear },
      { 
        username: cleanUsername,
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
