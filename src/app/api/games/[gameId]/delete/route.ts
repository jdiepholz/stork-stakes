import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  const session = await getAuthenticatedUser(req);
  const userId = session?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the user is the game creator
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.createdBy !== userId) {
      return NextResponse.json(
        { error: 'Only the game creator can delete this game' },
        { status: 403 }
      );
    }

    // Check if game is already deleted
    const gameWithFields = game as { id: string; deletedAt: Date | null };
    if (gameWithFields.deletedAt) {
      return NextResponse.json({ error: 'Game is already deleted' }, { status: 400 });
    }

    // Soft delete the game by setting deletedAt timestamp
    const deletedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Game deleted successfully',
      deletedAt: deletedGame.updatedAt,
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Error deleting game' }, { status: 500 });
  }
}
