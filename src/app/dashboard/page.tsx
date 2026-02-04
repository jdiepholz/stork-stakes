'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Game {
  id: string;
  name: string;
  createdAt: string;
  isOwner: boolean;
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [myGames, setMyGames] = useState<Game[]>([]);
  const [joinGameId, setJoinGameId] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    if (!userId || !userEmail) {
      router.push('/auth');
      return;
    }

    setUser({ id: userId, email: userEmail, name: userName || undefined });

    // Fetch user's games
    fetch('/api/users/me/games', {
      headers: {
        'Authorization': userId,
      },
    })
      .then(res => {
        if (res.status === 401 || res.status === 404) {
          // Invalid user, clear localStorage and redirect to login
          localStorage.removeItem('userId');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          router.push('/auth');
          return [];
        }
        return res.json();
      })
      .then(setMyGames)
      .catch(console.error);
  }, [router]);

  const handleCreateGame = () => {
    router.push('/games/new');
  };

  const handleJoinGame = () => {
    if (!joinGameId.trim()) {
      toast.error('Please enter a game ID');
      return;
    }
    router.push(`/games/${joinGameId.trim()}`);
  };

  const copyGameLink = (gameId: string) => {
    const link = `${window.location.origin}/games/${gameId}`;
    navigator.clipboard.writeText(link);
    toast.success('Game link copied to clipboard!');
  };

  const getDisplayName = () => {
    if (user?.name && user.name.trim()) {
      return user.name;
    }
    return user?.email || '';
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create New Game */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Game</CardTitle>
              <CardDescription>
                Start a new baby prediction game and share it with friends.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCreateGame} className="w-full">
                Create Game
              </Button>
            </CardContent>
          </Card>

          {/* Join Existing Game */}
          <Card>
            <CardHeader>
              <CardTitle>Join Game</CardTitle>
              <CardDescription>
                Enter a game ID to join an existing prediction game.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gameId">Game ID</Label>
                <Input
                  id="gameId"
                  placeholder="Enter game ID"
                  value={joinGameId}
                  onChange={(e) => setJoinGameId(e.target.value)}
                />
              </div>
              <Button onClick={handleJoinGame} className="w-full">
                Join Game
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* My Games */}
        {myGames.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Games</CardTitle>
              <CardDescription>
                Games you&apos;ve created or participated in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myGames.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{game.name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {game.isOwner ? 'Creator' : 'Participant'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(game.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-x-2">
                      {game.isOwner && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyGameLink(game.id)}
                          >
                            Share Link
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/games/${game.id}/manage`)}
                          >
                            Manage Game
                          </Button>
                        </>
                      )}
                      {!game.isOwner && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/games/${game.id}/overview`)}
                          >
                            Game Overview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/games/${game.id}`)}
                          >
                            My Predictions
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}