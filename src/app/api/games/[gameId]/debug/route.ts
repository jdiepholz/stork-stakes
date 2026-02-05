import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const session = await getAuthenticatedUser(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the game directly from database
    const game = await prisma.game.findFirst({
      where: {
        id: gameId,
        deletedAt: null,
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const gameWithFields = game as {
      id: string;
      name: string;
      publishedQuestions: unknown;
      actualResults: unknown;
      status: string;
    };

    return NextResponse.json({
      gameId: game.id,
      gameName: game.name,
      rawPublishedQuestions: gameWithFields.publishedQuestions,
      publishedQuestionsType: typeof gameWithFields.publishedQuestions,
      isArray: Array.isArray(gameWithFields.publishedQuestions),
      actualResults: gameWithFields.actualResults,
      actualResultsType: typeof gameWithFields.actualResults,
      actualResultsKeys: gameWithFields.actualResults
        ? Object.keys(gameWithFields.actualResults)
        : null,
      status: gameWithFields.status,
      debug: {
        allFields: Object.keys(game),
        publishedQuestionsValue: gameWithFields.publishedQuestions,
        actualResultsValue: gameWithFields.actualResults,
      },
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ error: 'Error fetching debug info' }, { status: 500 });
  }
}
