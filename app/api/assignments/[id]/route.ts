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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Retrieve specific assignment owned by this user
    const assignment = await Assignment.findOne({ _id: id, userId: user.id });
    
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error('Fetch Single Assignment API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignment details' },
      { status: 500 }
    );
  }
}
