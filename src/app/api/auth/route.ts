import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import dbConnect, { MONGODB_URI } from '@/lib/mongodb';
import { User } from '@/lib/models';

// Hashing helper
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Check if database is configured
    if (!MONGODB_URI) {
      return NextResponse.json({ 
        isLocalMode: true, 
        message: 'No MONGODB_URI configured. Authenticate client-side.' 
      });
    }

    const body = await request.json();
    const { action, username, password } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action parameter (login, register, logout) is required' }, { status: 400 });
    }

    await dbConnect();
    const cookieStore = await cookies();

    // ACTION: LOGOUT
    if (action === 'logout') {
      cookieStore.delete('auth_user');
      return NextResponse.json({ success: true, message: 'Logged out successfully' });
    }

    // Validation for credentials actions
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    // ACTION: REGISTER
    if (action === 'register') {
      const existingUser = await User.findOne({ username: cleanUsername });
      if (existingUser) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
      }

      // Generate secure salt & hash the credentials
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);

      await User.create({
        username: cleanUsername,
        passwordHash,
        salt
      });

      // Set cookie for session persistence
      cookieStore.set('auth_user', cleanUsername, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      });

      return NextResponse.json({ 
        success: true, 
        isLocalMode: false, 
        username: cleanUsername, 
        message: 'User registered and authenticated successfully' 
      });
    }

    // ACTION: LOGIN
    if (action === 'login') {
      const user = await User.findOne({ username: cleanUsername });
      if (!user) {
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
      }

      // Re-hash and compare with database
      const hash = hashPassword(password, user.salt);
      if (hash !== user.passwordHash) {
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
      }

      // Set HTTP-Only authentication cookie
      cookieStore.set('auth_user', cleanUsername, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      });

      return NextResponse.json({ 
        success: true, 
        isLocalMode: false, 
        username: cleanUsername, 
        message: 'Authenticated successfully' 
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('Auth API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
