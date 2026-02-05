import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const userId = req.headers.get('Authorization');
  const { questions } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!questions || !Array.isArray(questions)) {
    return NextResponse.json({ error: 'Questions array is required' }, { status: 400 });
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
        { error: 'Only the game creator can publish questions' },
        { status: 403 }
      );
    }

    // Get current published questions and add new ones
    const gameWithPublishedQuestions = game as { publishedQuestions: unknown };
    const currentPublishedQuestions = Array.isArray(gameWithPublishedQuestions.publishedQuestions)
      ? (gameWithPublishedQuestions.publishedQuestions as string[])
      : [];

    console.log('Current published questions:', currentPublishedQuestions);
    console.log('Questions to publish:', questions);

    // Add new questions to the published list (avoid duplicates)
    const newPublishedQuestions = [...new Set([...currentPublishedQuestions, ...questions])];

    console.log('New published questions list:', newPublishedQuestions);

    // Update the game with published questions
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        publishedQuestions: newPublishedQuestions,
      },
    });

    const updatedGameWithFields = updatedGame as { publishedQuestions: unknown };
    console.log('Updated game published questions:', updatedGameWithFields.publishedQuestions);

    return NextResponse.json({
      success: true,
      publishedQuestions: newPublishedQuestions,
      message: `Published ${questions.length} question(s). Total published: ${newPublishedQuestions.length}`,
    });
  } catch (error) {
    console.error('Error publishing questions:', error);
    return NextResponse.json({ error: 'Error publishing questions' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  const userId = req.headers.get('Authorization');
  const { questions } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!questions || !Array.isArray(questions)) {
    return NextResponse.json({ error: 'Questions array is required' }, { status: 400 });
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
        { error: 'Only the game creator can unpublish questions' },
        { status: 403 }
      );
    }

    // Get current published questions and remove the specified ones
    const gameWithPublishedQuestions = game as { publishedQuestions: unknown };
    const currentPublishedQuestions = Array.isArray(gameWithPublishedQuestions.publishedQuestions)
      ? (gameWithPublishedQuestions.publishedQuestions as string[])
      : [];

    console.log('Current published questions:', currentPublishedQuestions);
    console.log('Questions to unpublish:', questions);

    // Remove questions from the published list
    const newPublishedQuestions = currentPublishedQuestions.filter((q) => !questions.includes(q));

    console.log('New published questions list after unpublishing:', newPublishedQuestions);

    // Update the game with the new published questions list
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        publishedQuestions: newPublishedQuestions,
      },
    });

    const updatedGameWithFields = updatedGame as { publishedQuestions: unknown };
    console.log('Updated game published questions:', updatedGameWithFields.publishedQuestions);

    return NextResponse.json({
      success: true,
      publishedQuestions: newPublishedQuestions,
      message: `Unpublished ${questions.length} question(s). Total published: ${newPublishedQuestions.length}`,
    });
  } catch (error) {
    console.error('Error unpublishing questions:', error);
    return NextResponse.json({ error: 'Error unpublishing questions' }, { status: 500 });
  }
}
