import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/games/[gameId]/questions - Get all questions for a game (default + custom)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    // Get the game to verify it exists
    const game = await prisma.game.findUnique({
      where: { id: gameId, deletedAt: null },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Get custom questions for this game
    const customQuestions = await prisma.question.findMany({
      where: { gameId },
      orderBy: { order: 'asc' },
      include: {
        creator: {
          select: { id: true, email: true, name: true }
        }
      }
    });

    return NextResponse.json({ questions: customQuestions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/games/[gameId]/questions - Add a custom question to a game
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { text, type = 'TEXT', placeholder, options, createdBy, isDefault = false, order } = await request.json();

    if (!text || !createdBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the game exists and user has permission
    const game = await prisma.game.findUnique({
      where: { id: gameId, deletedAt: null },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Get the next order number if not provided
    let finalOrder = order;
    if (!finalOrder) {
      const maxOrder = await prisma.question.findFirst({
        where: { gameId },
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      finalOrder = (maxOrder?.order || 0) + 1;
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        text,
        type,
        placeholder: placeholder || null,
        options: options || null,
        gameId,
        createdBy,
        order: finalOrder,
        isDefault: isDefault
      },
      include: {
        creator: {
          select: { id: true, email: true, name: true }
        }
      }
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Question already exists in this game' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/games/[gameId]/questions - Delete all questions for a game (for question reordering)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    // Verify the game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId, deletedAt: null },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Delete all questions for this game
    await prisma.question.deleteMany({
      where: { gameId }
    });

    return NextResponse.json({ message: 'All questions deleted successfully' });
  } catch (error) {
    console.error('Error deleting questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}