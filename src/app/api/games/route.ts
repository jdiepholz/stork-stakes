import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  const session = await getAuthenticatedUser(req);
  if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const createdBy = session.userId;

  if (!name) {
    return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  }

  try {
    // First, verify that the user exists
    const user = await prisma.user.findUnique({
      where: { id: createdBy },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid user. Please log in again.' }, { status: 401 });
    }

    const game = await prisma.game.create({
      data: {
        name,
        createdBy,
      },
    });
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Error creating game' }, { status: 500 });
  }
}

