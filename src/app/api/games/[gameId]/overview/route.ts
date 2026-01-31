import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getAllQuestionsForGame } from '@/lib/questions';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    // Get the game overview (excluding soft-deleted)
    const game = await prisma.game.findFirst({
      where: { 
        id: gameId,
        deletedAt: null, // Only non-deleted games
      },
      include: {
        bets: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Get all questions for this game (ordered)
    const questions = await getAllQuestionsForGame(gameId);

    // Get the creator's name
    // const creator = await prisma.user.findUnique({
    //   where: { id: game.createdBy },
    //   select: { name: true }
    // }); // Unused for now

    // Format the response to match the frontend expectations
    
    // Group bets by user (excluding the game creator)
    const participantMap = new Map();
    game.bets?.forEach((bet: { userId: string; question: string; answer: string | null; user: { id: string; email: string; name: string | null } }) => {
      const userId = bet.userId;
      
      // Skip bets from the game creator
      if (userId === game.createdBy) {
        return;
      }
      
      if (!participantMap.has(userId)) {
        participantMap.set(userId, {
          userId: userId,
          userEmail: bet.user?.email || 'Unknown',
          userName: bet.user?.name,
          predictions: []
        });
      }
      participantMap.get(userId).predictions.push({
        question: bet.question,
        answer: bet.answer
      });
    });

    const gameOverview = {
      id: game.id,
      name: game.name,
      status: (game as { status: string }).status,
      createdBy: game.createdBy,
      actualResults: (game as { actualResults: unknown }).actualResults,
      publishedQuestions: (() => {
        const gameWithFields = game as { publishedQuestions: unknown };
        let publishedQuestions: string[] = [];
        if (gameWithFields.publishedQuestions) {
          try {
            publishedQuestions = typeof gameWithFields.publishedQuestions === 'string' 
              ? JSON.parse(gameWithFields.publishedQuestions)
              : gameWithFields.publishedQuestions as string[];
          } catch {
            publishedQuestions = Array.isArray(gameWithFields.publishedQuestions) 
              ? gameWithFields.publishedQuestions 
              : [];
          }
        }
        return publishedQuestions;
      })(),
      questions: questions,
      participants: Array.from(participantMap.values()),
    };

    return NextResponse.json(gameOverview);
  } catch (error) {
    console.error('Error fetching game overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game overview' },
      { status: 500 }
    );
  }
}