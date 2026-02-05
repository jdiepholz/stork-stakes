import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE /api/games/[gameId]/questions/[questionId] - Delete a custom question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string; questionId: string }> }
) {
  try {
    const { gameId, questionId } = await params;

    // Verify the question exists and belongs to this game
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        gameId,
        isDefault: false, // Only allow deleting custom questions
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Custom question not found' }, { status: 404 });
    }

    // Delete the question
    await prisma.question.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/games/[gameId]/questions/[questionId] - Update a custom question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string; questionId: string }> }
) {
  try {
    const { gameId, questionId } = await params;
    const { text, type, placeholder, options } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    // Verify the question exists and belongs to this game
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        gameId,
        isDefault: false, // Only allow updating custom questions
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Custom question not found' }, { status: 404 });
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        type: type || question.type,
        placeholder: placeholder !== undefined ? placeholder : question.placeholder,
        options: options || question.options,
      },
      include: {
        creator: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Question already exists in this game' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
