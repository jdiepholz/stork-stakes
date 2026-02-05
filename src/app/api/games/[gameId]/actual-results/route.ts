import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const session = await getAuthenticatedUser(req);
  const userId = session?.userId;
  const requestBody = await req.json();

  console.log('Received actual results data:', requestBody);

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
      return NextResponse.json(
        { error: 'Only the game creator can set actual results' },
        { status: 403 }
      );
    }

    // Process the dynamic results data
    const actualResultsData: Record<string, unknown> = {};

    // Clean and store only non-empty values
    Object.keys(requestBody).forEach((key) => {
      const value = requestBody[key];
      if (value && typeof value === 'string' && value.trim() !== '') {
        actualResultsData[key] = value.trim();
      } else if (value && typeof value !== 'string') {
        actualResultsData[key] = value;
      }
    });

    console.log('Storing actual results data:', actualResultsData);

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        actualResults: actualResultsData as Record<string, string>,
      },
    });

    console.log('Successfully updated game with actual results');
    return NextResponse.json({ success: true, game: updatedGame });
  } catch (error) {
    console.error('Error saving actual results:', error);
    return NextResponse.json({ error: 'Error saving actual results' }, { status: 500 });
  }
}
