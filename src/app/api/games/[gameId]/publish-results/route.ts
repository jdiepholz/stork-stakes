import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const userId = req.headers.get('Authorization');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the user is the game creator and game is not soft-deleted
    const game = await prisma.game.findFirst({
      where: { 
        id: gameId,
        deletedAt: null,
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.createdBy !== userId) {
      return NextResponse.json({ error: 'Only the game creator can publish results' }, { status: 403 });
    }

    // Update the game status to published
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'RESULTS_PUBLISHED',
      },
    });

    return NextResponse.json({ success: true, game: updatedGame });
  } catch (error) {
    console.error('Error publishing results:', error);
    return NextResponse.json({ error: 'Error publishing results' }, { status: 500 });
  }
}