import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Assignment from '@/lib/models/Assignment';

async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('veda_session')?.value;
    if (!token) return null;
    
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  try {
    await dbConnect();

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve user's assignments
    const list = await Assignment.find({ userId: user.id }).sort({ createdAt: -1 });
    
    return NextResponse.json(list);
  } catch (error: any) {
    console.error('Fetch Assignments API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}
