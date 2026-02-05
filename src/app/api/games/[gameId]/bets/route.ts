import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;

  try {
    // First verify the game exists and is not soft-deleted
    const game = await prisma.game.findFirst({
      where: {
        id: gameId,
        deletedAt: null,
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const bets = await prisma.bet.findMany({
      where: { gameId },
    });
    return NextResponse.json(bets);
  } catch (error) {
    console.error(`Error fetching bets for game ${gameId}:`, error);
    return NextResponse.json({ error: 'Error fetching bets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const { question, userId } = await req.json();

  if (!question || !userId) {
    return NextResponse.json({ error: 'Missing question or userId' }, { status: 400 });
  }

  try {
    // First verify the game exists and is not soft-deleted
    const game = await prisma.game.findFirst({
      where: {
        id: gameId,
        deletedAt: null,
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const bet = await prisma.bet.create({
      data: {
        question,
        gameId,
        userId,
      },
    });
    return NextResponse.json(bet, { status: 201 });
  } catch (error) {
    console.error('Error submitting bet:', error);
    return NextResponse.json({ error: 'Error submitting bet' }, { status: 500 });
  }
}
