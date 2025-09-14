import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAllQuestionsForGame, Question } from '@/lib/questions';

const prisma = new PrismaClient();

interface Bet {
  id: string;
  question: string;
  answer: string | null;
  createdAt: Date;
  updatedAt: Date;
  gameId: string;
  userId: string;
}

interface BetWithQuestionInfo extends Bet {
  questionType: string;
  questionOptions: string[] | null;
  questionPlaceholder?: string;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    // Check if the game exists and is not soft-deleted
    const game = await prisma.game.findFirst({
      where: { 
        id: gameId,
        deletedAt: null,
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Get published questions
    const gameWithFields = game as { publishedQuestions: unknown };
    let publishedQuestions: string[] = [];
    if (gameWithFields.publishedQuestions) {
      try {
        publishedQuestions = typeof gameWithFields.publishedQuestions === 'string' 
          ? JSON.parse(gameWithFields.publishedQuestions)
          : gameWithFields.publishedQuestions as string[];
      } catch (_error) {
        publishedQuestions = Array.isArray(gameWithFields.publishedQuestions) 
          ? gameWithFields.publishedQuestions 
          : [];
      }
    }

    // If user is the creator, they don't need to make predictions
    if (game.createdBy === userId) {
      return NextResponse.json({ isCreator: true, bets: [], publishedQuestions });
    }

    // Get all questions for this game (default + custom)
    const questions: Question[] = await getAllQuestionsForGame(gameId);

    // Check if user already has bets for this game
    const existingBets: Bet[] = await prisma.bet.findMany({
      where: { 
        gameId,
        userId,
      },
    });

    if (existingBets.length > 0) {
      // User already has bets, return them with question details
      const betsWithQuestionInfo: BetWithQuestionInfo[] = existingBets.map((bet: Bet) => {
        const question = questions.find((q: Question) => q.text === bet.question);
        return {
          ...bet,
          questionType: question?.type || 'TEXT',
          questionOptions: question?.options || null,
          questionPlaceholder: question?.placeholder || undefined
        };
      });
      return NextResponse.json({ isCreator: false, bets: betsWithQuestionInfo, publishedQuestions, questions });
    }

    // Create bets for all questions in the game
    const bets: Bet[] = await Promise.all(
      questions.map((question: Question) =>
        prisma.bet.create({
          data: {
            question: question.text,
            gameId,
            userId,
          },
        })
      )
    );

    // Add question type info to the bets
    const betsWithQuestionInfo: BetWithQuestionInfo[] = bets.map((bet: Bet) => {
      const question = questions.find((q: Question) => q.text === bet.question);
      return {
        ...bet,
        questionType: question?.type || 'TEXT',
        questionOptions: question?.options || null,
        questionPlaceholder: question?.placeholder || undefined
      };
    });

    return NextResponse.json({ isCreator: false, bets: betsWithQuestionInfo, publishedQuestions, questions });
  } catch (error) {
    console.error('Error creating user bets:', error);
    return NextResponse.json({ error: 'Error creating bets' }, { status: 500 });
  }
}