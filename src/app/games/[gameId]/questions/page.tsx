'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import GameQuestionsSetup from '@/components/GameQuestionsSetup';

interface Question {
  id?: string;
  text: string;
  type: string;
  placeholder?: string;
  options?: string[];
  order: number;
  isDefault: boolean;
  isCustom?: boolean;
}

interface GameData {
  id: string;
  name: string;
  createdBy: string;
  questions: Question[];
}

export default function EditQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userId || !userEmail) {
      router.push(`/auth?redirect=/games/${gameId}/questions`);
      return;
    }

    setUser({ id: userId, email: userEmail });
  }, [router, gameId]);

  useEffect(() => {
    if (gameId && user) {
      // Fetch game data and questions
      fetch(`/api/games/${gameId}/manage`, {
        headers: {
          'Authorization': user.id,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Not authorized or game not found');
          }
          return res.json();
        })
        .then((data) => {
          setGameData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching game data:', error);
          toast.error('You are not authorized to edit this game or it does not exist.');
          router.push('/dashboard');
        });
    }
  }, [gameId, user, router]);

  const handleQuestionsComplete = (gameId: string) => {
    toast.success('Questions updated successfully!');
    router.push(`/games/${gameId}/manage`);
  };

  const handleBack = () => {
    router.push(`/games/${gameId}/manage`);
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

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Edit Game Questions</h1>
          <p className="text-muted-foreground mt-2">
            Modify the questions for &quot;{gameData.name}&quot;. You can reorder, delete, or add custom questions.
          </p>
        </div>
        
        <GameQuestionsSetup 
          gameId={gameId}
          userId={user.id}
          onComplete={handleQuestionsComplete}
          onBack={handleBack}
          mode="edit"
          existingQuestions={gameData.questions}
        />
      </div>
    </main>
  );
}