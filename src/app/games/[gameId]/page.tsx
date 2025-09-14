'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import QuestionInput from '@/components/QuestionInput';

interface BetWithQuestionInfo {
  id: string;
  question: string;
  answer: string | null;
  questionType: string;
  questionOptions: string[] | null;
  questionPlaceholder?: string;
}

interface GameData {
  isCreator: boolean;
  bets: BetWithQuestionInfo[];
  publishedQuestions: string[];
  questions?: { id: string; text: string; type: string; options: string[] | null }[];
  error?: string;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userId || !userEmail) {
      router.push(`/auth?redirect=/games/${gameId}`);
      return;
    }

    setUser({ id: userId, email: userEmail });
  }, [router, gameId]);

  useEffect(() => {
    if (gameId && user) {
      // Fetch or create bets for this user in this game
      fetch(`/api/games/${gameId}/user-bets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': user.id,
        },
        body: JSON.stringify({ userId: user.id }),
      })
        .then((res) => {
          if (!res.ok) {
            if (res.status === 404) {
              toast.error('Game not found or no longer available.');
              router.push('/dashboard');
              return null;
            }
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data: GameData | null) => {
          if (!data) return; // Handle the 404 case
          
          if (data.error) {
            toast.error('Game not found or no longer available.');
            router.push('/dashboard');
            return;
          }
          
          setGameData(data);
          
          if (!data.isCreator && data.bets) {
            // Prefill existing answers for participants
            const existingAnswers: { [key: string]: string } = {};
            data.bets.forEach((bet: BetWithQuestionInfo) => {
              if (bet.answer) {
                existingAnswers[bet.id] = bet.answer;
              }
            });
            setAnswers(existingAnswers);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching bets:', error);
          toast.error('Error loading game. Please try again.');
          router.push('/dashboard');
          setLoading(false);
        });
    }
  }, [gameId, user, router]);

  const handleAnswerChange = (betId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [betId]: value }));
  };

    // Input validation functions
  // const handleWeightChange = (betId: string, value: string) => {
  //   // Allow numbers with comma or dot as thousands separator for grams
  //   const cleanValue = value.replace(/[^0-9,.]/, '');
  //   const normalizedValue = cleanValue.replace(',', '.');
  //   const parts = normalizedValue.split('.');
  //   const validValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : normalizedValue;
  //   setAnswers((prev) => ({ ...prev, [betId]: validValue }));
  // };

  // const handleNumberChange = (betId: string, value: string) => {
  //   // Remove any non-numeric characters
  //   const cleanValue = value.replace(/[^0-9]/, '');
  //   setAnswers((prev) => ({ ...prev, [betId]: cleanValue }));
  // };

  const handleSaveAnswers = async () => {
    if (!user) return;

    try {
      // Update each bet with the user's answer
      for (const betId in answers) {
        const answer = answers[betId];
        if (answer) {
          await fetch(`/api/games/${gameId}/bets/${betId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer, userId: user.id }),
          });
        }
      }

      toast.success('Predictions saved successfully!');
      
      // Redirect to overview page
      router.push(`/games/${gameId}/overview`);
    } catch (error) {
      console.error('Error saving predictions:', error);
      toast.error('Failed to save predictions.');
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div>Loading...</div>
      </main>
    );
  }

  if (!user || !gameData) {
    return null;
  }

  // If user is the creator, redirect them to the overview or manage page
  if (gameData.isCreator) {
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">You&apos;re the Game Creator!</h1>
            <p className="text-gray-600">As the creator, you don&apos;t need to make predictions. You can view all participants&apos; predictions and manage the game results.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Button 
                onClick={() => router.push(`/games/${gameId}/overview`)}
                className="w-full"
              >
                View All Predictions
              </Button>
              <Button 
                onClick={() => router.push(`/games/${gameId}/manage`)}
                variant="outline"
                className="w-full"
              >
                Manage Game & Results
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Manage Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => router.push(`/games/${gameId}/questions`)}
                  variant="outline"
                  className="w-full"
                >
                  ✏️ Edit Game Questions
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  Add, remove, or reorder questions for your game.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  const hasExistingAnswers = gameData.bets.some((bet: BetWithQuestionInfo) => bet.answer);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Make Your Predictions!</h1>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/games/${gameId}/overview`)}
            >
              View Overview
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
            >
              Dashboard
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gameData.bets.map((bet) => {
                const isLocked = gameData.publishedQuestions.includes(bet.question);
                
                return (
                  <QuestionInput
                    key={bet.id}
                    bet={bet}
                    value={answers[bet.id] || ''}
                    onChange={handleAnswerChange}
                    isLocked={isLocked}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Button onClick={handleSaveAnswers} className="w-full">
          {hasExistingAnswers ? 'Update Predictions' : 'Save Predictions'}
        </Button>
      </div>
    </main>
  );
}
