'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
// import { defaultQuestions } from '@/lib/questions'; // Unused
import GameQuestionsSetup from '@/components/GameQuestionsSetup';

export default function NewGamePage() {
  const [step, setStep] = useState<'name' | 'questions' | 'created'>('name');
  const [gameName, setGameName] = useState('');
  const [gameId, setGameId] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [successDialog, setSuccessDialog] = useState({ open: false, gameLink: '', gameId: '' });
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userId || !userEmail) {
      router.push('/auth?redirect=/games/new');
      return;
    }

    setUser({ id: userId, email: userEmail });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in first.');
      return;
    }

    if (!gameName.trim()) {
      toast.error('Please enter a game name.');
      return;
    }

    try {
      const gameResponse = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: gameName.trim(), createdBy: user.id }),
      });

      if (gameResponse.ok) {
        const game = await gameResponse.json();
        setGameId(game.id);
        setStep('questions');
      } else {
        const errorData = await gameResponse.json();
        if (gameResponse.status === 401) {
          // Invalid user, clear localStorage and redirect to login
          localStorage.removeItem('userId');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          toast.error('Your session has expired. Please log in again.');
          router.push('/auth?redirect=/games/new');
        } else {
          toast.error(errorData.error || 'Failed to create game.');
        }
      }
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('An error occurred while creating the game.');
    }
  };

  const handleQuestionsComplete = (finalGameId: string) => {
    // Show the shareable link
    const gameLink = `${window.location.origin}/games/${finalGameId}`;
    setSuccessDialog({ open: true, gameLink, gameId: finalGameId });
    setStep('created');
  };

  const copyLinkAndRedirect = (gameId: string, gameLink: string) => {
    navigator.clipboard.writeText(gameLink);
    toast.success('Game link copied to clipboard!');
    setSuccessDialog({ open: false, gameLink: '', gameId: '' });
    router.push(`/games/${gameId}`);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Step 1: Game Name
  if (step === 'name') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        <form onSubmit={handleSubmit} className="w-full max-w-[350px]">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Create a New Game</CardTitle>
              <CardDescription>Enter a name for your baby prediction game.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Game Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., The Great Baby Bet"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Next: Setup Questions</Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    );
  }

  // Step 2: Questions Setup
  if (step === 'questions' && gameId) {
    return (
      <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Setup Your Game Questions</h1>
            <p className="text-gray-600 mt-2">
              Customize the questions for &quot;{gameName}&quot;. You can reorder, delete, or add custom questions.
            </p>
          </div>
          
          <GameQuestionsSetup 
            gameId={gameId}
            userId={user.id}
            onComplete={handleQuestionsComplete}
            onBack={() => setStep('name')}
          />
        </div>
      </main>
    );
  }

  // Default return with success dialog
  return (
    <>
      {/* Success Dialog */}
      <Dialog open={successDialog.open} onOpenChange={(open) => setSuccessDialog({ ...successDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 Game Created Successfully!</DialogTitle>
            <DialogDescription>
              Your prediction game has been created. Share the link below with your friends to start collecting predictions!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium">Game Link:</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input value={successDialog.gameLink} readOnly className="text-sm" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(successDialog.gameLink);
                    toast.success('Link copied to clipboard!');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => copyLinkAndRedirect(successDialog.gameId, successDialog.gameLink)}>
              Copy Link & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
