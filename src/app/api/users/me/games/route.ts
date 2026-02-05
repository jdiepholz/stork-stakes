import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAuthenticatedUser(req);
  const userId = session?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get games the user created (excluding soft-deleted)
    const createdGames = await prisma.game.findMany({
      where: {
        createdBy: userId,
        deletedAt: null, // Only non-deleted games
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get games the user has participated in (has bets, excluding soft-deleted)
    const participatedGames = await prisma.game.findMany({
      where: {
        bets: {
          some: {
            userId: userId,
          },
        },
        createdBy: {
          not: userId, // Exclude games they created (already in createdGames)
        },
        deletedAt: null, // Only non-deleted games
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Combine and mark which games are owned vs participated
    const allGames = [
      ...createdGames.map((game) => ({ ...game, isOwner: true })),
      ...participatedGames.map((game) => ({ ...game, isOwner: false })),
    ];

    return NextResponse.json(allGames);
  } catch (error) {
    console.error('Error fetching user games:', error);
    return NextResponse.json({ error: 'Error fetching games' }, { status: 500 });
  }
}
