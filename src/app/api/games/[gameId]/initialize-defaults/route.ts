import { NextRequest, NextResponse } from 'next/server';
import { initializeDefaultQuestions } from '@/lib/questions';

// POST /api/games/[gameId]/initialize-defaults - Initialize default questions for a new game
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { createdBy } = await request.json();

    if (!createdBy) {
      return NextResponse.json({ error: 'createdBy is required' }, { status: 400 });
    }

    // Initialize default questions
    const questions = await initializeDefaultQuestions(gameId, createdBy);

    return NextResponse.json({ 
      success: true, 
      questionsCreated: questions.length,
      questions 
    });
  } catch (error) {
    console.error('Error initializing default questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}