import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please enter both email and password' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session payload
    const sessionUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    // Serialize payload to base64
    const token = Buffer.from(JSON.stringify(sessionUser)).toString('base64');

    // Write HTTP-only cookie using async cookies() API in Next.js 15/16
    const cookieStore = await cookies();
    cookieStore.set('veda_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({
      message: 'Logged in successfully!',
      user: sessionUser,
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again later.' },
      { status: 500 }
    );
  }
}
