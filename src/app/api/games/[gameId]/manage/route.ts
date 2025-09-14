import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAllQuestionsForGame } from '@/lib/questions';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const userId = req.headers.get('Authorization');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the game and verify the user is the creator (excluding soft-deleted)
    const game = await prisma.game.findFirst({
      where: { 
        id: gameId,
        deletedAt: null, // Only non-deleted games
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.createdBy !== userId) {
      return NextResponse.json({ error: 'Only the game creator can manage this game' }, { status: 403 });
    }

    // Get all questions for this game (ordered)
    const gameQuestions = await getAllQuestionsForGame(gameId);
    // const questionTexts = gameQuestions.map(q => q.text); // Unused for now

    // Get all bets for this game with user information
    const bets = await prisma.bet.findMany({
      where: { gameId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Group bets by user (excluding the game creator)
    const participantMap = new Map();
    
    bets.forEach((bet: { userId: string; question: string; answer: string | null; user: { email: string; name: string | null } }) => {
      // Skip bets from the game creator
      if (bet.userId === game.createdBy) {
        return;
      }
      
      if (!participantMap.has(bet.userId)) {
        participantMap.set(bet.userId, {
          userId: bet.userId,
          userEmail: bet.user.email,
          userName: bet.user.name,
          predictions: [],
        });
      }
      
      participantMap.get(bet.userId).predictions.push({
        question: bet.question,
        answer: bet.answer,
      });
    });

    const participants = Array.from(participantMap.values());

    const gameWithFields = game as { publishedQuestions: unknown; status: string; actualResults: unknown };
    
    // Parse published questions
    let publishedQuestions: string[] = [];
    if (gameWithFields.publishedQuestions) {
      try {
        publishedQuestions = typeof gameWithFields.publishedQuestions === 'string' 
          ? JSON.parse(gameWithFields.publishedQuestions)
          : gameWithFields.publishedQuestions;
      } catch (_error) {
        publishedQuestions = Array.isArray(gameWithFields.publishedQuestions) 
          ? gameWithFields.publishedQuestions 
          : [];
      }
    }
    
    const gameData = {
      id: game.id,
      name: game.name,
      status: gameWithFields.status,
      actualResults: gameWithFields.actualResults,
      publishedQuestions,
      participants,
      questions: gameQuestions, // Use full question objects
    };

    return NextResponse.json(gameData);
  } catch (error) {
    console.error('Error fetching game management data:', error);
    return NextResponse.json({ error: 'Error fetching game data' }, { status: 500 });
  }
}