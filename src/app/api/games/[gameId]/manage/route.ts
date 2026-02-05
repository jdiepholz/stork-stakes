import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAllQuestionsForGame } from '@/lib/questions';
import { getAuthenticatedUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const session = await getAuthenticatedUser(req);
  const userId = session?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found. Please log in again.' }, { status: 401 });
    }

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
      select: {
        id: true,
        question: true,
        answer: true,
        userId: true,
        username: true,
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
    
    bets.forEach((bet: { 
      userId: string | null; 
      username: string | null; 
      question: string; 
      answer: string | null; 
      user: { email: string; name: string | null; id: string } | null 
    }) => {
      // Skip bets from the game creator (only registered users can be creators)
      if (bet.userId === game.createdBy) {
        return;
      }
      
      // Create a unique key for each participant
      const participantKey = bet.userId || `anonymous_${bet.username}`;
      
      if (!participantMap.has(participantKey)) {
        participantMap.set(participantKey, {
          userId: bet.userId || participantKey,
          userEmail: bet.user?.email || bet.username || 'Anonymous',
          userName: bet.user?.name || bet.username,
          predictions: [],
        });
      }
      
      participantMap.get(participantKey).predictions.push({
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
      } catch {
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