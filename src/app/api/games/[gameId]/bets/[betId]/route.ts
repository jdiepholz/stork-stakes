import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string; betId: string }> }
) {
  const { betId } = await params;
  const body = await req.json();
  let { userId, username } = body;
  const { answer } = body;
  
  const session = await getAuthenticatedUser(req);
  if (session) {
    userId = session.userId;
  } else if (userId) {
    // User claims identity but is not authenticated
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!answer || (!userId && !username)) {
    return NextResponse.json({ error: 'Missing answer or user identifier' }, { status: 400 });
  }

  try {
    // Check if this bet belongs to the current user/username for this game
    const whereClause = userId ? { id: betId, userId: userId } : { id: betId, username: username };

    const existingBet = await prisma.bet.findFirst({
      where: whereClause,
      include: {
        game: true,
      },
    });

    if (!existingBet) {
      return NextResponse.json({ error: 'Bet not found or not owned by user' }, { status: 404 });
    }

    // Check if this question has been published (locked from editing)
    const gameWithFields = existingBet.game as { id: string; publishedQuestions: unknown };
    const publishedQuestions = gameWithFields.publishedQuestions;

    if (publishedQuestions) {
      let publishedArray: string[] = [];
      try {
        publishedArray =
          typeof publishedQuestions === 'string'
            ? JSON.parse(publishedQuestions)
            : (publishedQuestions as string[]);
      } catch {
        publishedArray = Array.isArray(publishedQuestions) ? publishedQuestions : [];
      }

      if (publishedArray.includes(existingBet.question)) {
        return NextResponse.json(
          {
            error:
              'This question has been locked. Results have been published and predictions can no longer be changed.',
          },
          { status: 403 }
        );
      }
    }

    // Update the bet with the answer
    const updatedBet = await prisma.bet.update({
      where: { id: betId },
      data: { answer },
    });

    return NextResponse.json(updatedBet);
  } catch (error) {
    console.error('Error updating bet:', error);
    return NextResponse.json({ error: 'Error updating bet' }, { status: 500 });
  }
}
