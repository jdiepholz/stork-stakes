'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function JoinPage() {
  const router = useRouter();
  const [gameHash, setGameHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const handleJoinGame = () => {
    if (!gameHash.trim()) {
      return;
    }
    setLoading(true);
    // Navigate to the game page with the hash
    router.push(`/games/${gameHash.trim()}`);
  };

  const handleCreateGame = async () => {
    setCreateLoading(true);
    // Check if user is authenticated
    const userId = localStorage.getItem('userId');
    if (userId) {
      // Verify the user actually exists by making a test API call
      try {
        const response = await fetch('/api/users/me/games', {
          headers: {
            Authorization: userId,
          },
        });

        if (response.ok) {
          router.push('/games/new');
        } else {
          // User token is invalid, clear it and redirect to auth
          localStorage.removeItem('userId');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          router.push('/auth?mode=register&redirect=/games/new');
        }
      } catch (error) {
        console.error('Error verifying user:', error);
        router.push('/auth?mode=register&redirect=/games/new');
      }
    } else {
      router.push('/auth?mode=register&redirect=/games/new');
    }
    setCreateLoading(false);
  };

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Get Started
            </h1>
            <p className="text-muted-foreground text-lg">
              Join an existing game or create your own
            </p>
          </div>

          {/* Two Options */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Join Game Card */}
            <Card className="hover:border-primary/50 border-2 transition-all">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <span className="text-2xl">🎮</span>
                </div>
                <CardTitle className="text-2xl">Join a Game</CardTitle>
                <CardDescription className="text-base">
                  Enter a game code to participate in predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gameHash">Game Code</Label>
                  <Input
                    id="gameHash"
                    placeholder="Enter game code..."
                    value={gameHash}
                    onChange={(e) => setGameHash(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleJoinGame();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleJoinGame}
                  disabled={!gameHash.trim() || loading}
                  className="w-full"
                  size="lg"
                >
                  Join Game →
                </Button>
                <p className="text-muted-foreground text-center text-sm">
                  No account required to participate!
                </p>
              </CardContent>
            </Card>

            {/* Create Game Card */}
            <Card className="hover:border-primary/50 border-2 transition-all">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <span className="text-2xl">✨</span>
                </div>
                <CardTitle className="text-2xl">Create a Game</CardTitle>
                <CardDescription className="text-base">
                  Set up a new baby prediction game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-muted-foreground space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Customize questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Share with unlimited guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>View results and scores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Manage game settings</span>
                  </div>
                </div>
                <Button
                  onClick={handleCreateGame}
                  variant="default"
                  className="w-full"
                  size="lg"
                  disabled={createLoading}
                >
                  {createLoading ? 'Checking...' : 'Create Game →'}
                </Button>
                <p className="text-muted-foreground text-center text-sm">
                  Account required for game creators
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Back to Home */}
          <div className="mt-8 space-y-4 text-center">
            <div className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <Button
                variant="link"
                className="h-auto p-0 font-semibold"
                onClick={() => router.push('/auth?mode=login')}
              >
                Sign In
              </Button>
            </div>
            <Button variant="ghost" onClick={() => router.push('/')}>
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
