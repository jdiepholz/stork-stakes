'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { calculateParticipantScores, getLeaderboard, calculateScrabbleScore } from '@/lib/scoring';

interface GameOverview {
  id: string;
  name: string;
  status: string;
  createdBy: string;
  actualResults: Record<string, string> | null;
  publishedQuestions: string[];
  participants: {
    userId: string;
    userEmail: string;
    userName?: string;
    predictions: {
      question: string;
      answer: string | null;
    }[];
  }[];
  questions: {
    id: string;
    text: string;
    type: string;
    placeholder?: string;
    options: string[] | null;
    isDefault: boolean;
    order: number;
  }[];
  error?: string;
}

export default function GameOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [gameData, setGameData] = useState<GameOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');

    if (userId && userEmail) {
      setUser({ id: userId, email: userEmail });
      setIsAnonymous(false);
    } else {
      // Anonymous user can still view overview
      setIsAnonymous(true);
      const savedUsername = localStorage.getItem(`game_${gameId}_username`);
      if (savedUsername) {
        setUsername(savedUsername);
      }
    }
  }, [gameId]);

  useEffect(() => {
    if (gameId) {
      const headers: HeadersInit = {};
      if (user) {
        headers['Authorization'] = user.id;
      }

      fetch(`/api/games/${gameId}/overview`, {
        headers,
      })
        .then((res) => {
          if (!res.ok) {
            if (res.status === 404) {
              toast.error('Game not found or no longer available.');
              router.push('/join');
              return;
            }
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data && !data.error) {
            setGameData(data);
          } else {
            toast.error('Game not found or no longer available.');
            router.push('/join');
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching game overview:', error);
          toast.error('Error loading game. Please try again.');
          router.push('/join');
          setLoading(false);
        });
    }
  }, [gameId, user, router]);

  const copyGameLink = () => {
    const link = `${window.location.origin}/games/${gameId}`;
    navigator.clipboard.writeText(link);
    toast.success('Game link copied to clipboard!');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        <div>Loading...</div>
      </main>
    );
  }

  if (!gameData || gameData.error) {
    return null;
  }

  const sortedParticipants = useMemo(() => {
    return [...gameData.participants].sort((a, b) => {
      const isUserA =
        (user &&
          (a.userId === user.id ||
            (user.email &&
              a.userEmail &&
              a.userEmail.toLowerCase() === user.email.toLowerCase()))) ||
        (username && (a.userName === username || a.userId === `anonymous_${username}`));

      const isUserB =
        (user &&
          (b.userId === user.id ||
            (user.email &&
              b.userEmail &&
              b.userEmail.toLowerCase() === user.email.toLowerCase()))) ||
        (username && (b.userName === username || b.userId === `anonymous_${username}`));

      if (isUserA && !isUserB) return -1;
      if (!isUserA && isUserB) return 1;

      const nameA = a.userName || a.userEmail || '';
      const nameB = b.userName || b.userEmail || '';
      return nameA.localeCompare(nameB);
    });
  }, [gameData.participants, user, username]);

  const isCreator = user && user.id === gameData.createdBy;
  const resultsPublished = gameData.status === 'RESULTS_PUBLISHED';
  const hasPublishedQuestions =
    gameData.publishedQuestions && gameData.publishedQuestions.length > 0;
  const canSeeResults = isCreator || resultsPublished || hasPublishedQuestions;

  // Calculate scores for published questions
  const participantScores =
    gameData.actualResults && hasPublishedQuestions
      ? calculateParticipantScores(
          gameData.participants,
          gameData.actualResults,
          gameData.questions.filter((q) => gameData.publishedQuestions.includes(q.text))
        )
      : [];
  const leaderboard = getLeaderboard(participantScores);
  const hasNumericalScoring = leaderboard.length > 0;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-3xl font-bold">{gameData.name} - Overview</h1>
          <div className="flex flex-wrap justify-center gap-2 md:justify-end">
            <Button variant="outline" onClick={copyGameLink}>
              Copy Game Link
            </Button>
            <Button onClick={() => router.push(`/games/${gameId}`)}>My Predictions</Button>
            {isCreator && (
              <Button onClick={() => router.push(`/games/${gameId}/manage`)}>Manage Game</Button>
            )}
            {user && (
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        {hasNumericalScoring && canSeeResults && (
          <Card>
            <CardHeader>
              <CardTitle>🏆 Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="mb-4 text-sm text-gray-600">Lower scores are better!</p>
                {leaderboard.map((participant, index) => {
                  const numericalQuestions = participant.questionScores.filter(
                    (q) => q.isNumerical
                  );
                  return (
                    <div
                      key={participant.userId}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        index === 0
                          ? 'border-yellow-200 bg-yellow-50'
                          : index === 1
                            ? 'border-gray-200 bg-gray-50'
                            : index === 2
                              ? 'border-orange-200 bg-orange-50'
                              : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                            index === 0
                              ? 'bg-yellow-500 text-white'
                              : index === 1
                                ? 'bg-gray-400 text-white'
                                : index === 2
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">
                            {participant.userName || participant.userEmail}
                            {user && participant.userId === user.id && ' (You)'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {numericalQuestions.length} numerical prediction
                            {numericalQuestions.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{participant.totalScore.toFixed(2)}</div>
                        {/* <div className="text-xs text-gray-500">total difference</div> */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              Predictions & Results
              {hasPublishedQuestions && (
                <span className="ml-2 text-sm font-normal text-green-600">
                  ({gameData.publishedQuestions?.length || 0} question(s) published)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-medium">Participant</th>
                      {gameData.questions.map((question, index) => {
                        const isPublished = gameData.publishedQuestions.includes(question.text);
                        return (
                          <th key={index} className="p-4 text-left font-medium">
                            {question.text}
                            {isPublished && <span className="ml-1 text-green-600">🔓</span>}
                            {!isPublished && !isCreator && (
                              <span className="ml-1 text-gray-400">🔒</span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {gameData.participants.map((participant) => {
                      const isCurrentUser =
                        (user &&
                          (participant.userId === user.id ||
                            (user.email &&
                              participant.userEmail &&
                              participant.userEmail.toLowerCase() ===
                                user.email.toLowerCase()))) ||
                        (username &&
                          (participant.userName === username ||
                            participant.userId === `anonymous_${username}`));

                      return (
                        <tr
                          key={participant.userId}
                          className={`border-b ${isCurrentUser ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}
                        >
                          <td className="p-4 font-medium">
                            {participant.userName || participant.userEmail}
                            {isCurrentUser && ' (You)'}
                          </td>
                          {gameData.questions.map((question, qIndex) => {
                            const prediction = participant.predictions.find(
                              (p) => p.question === question.text
                            );
                            const isPublished = gameData.publishedQuestions.includes(question.text);
                            const isOwnPrediction = isCurrentUser;
                            const canSeeValue = isCreator || isPublished || isOwnPrediction;

                            return (
                              <td key={qIndex} className="p-4">
                                {prediction?.answer ? (
                                  canSeeValue ? (
                                    question.type === 'SCRABBLE' ? (
                                      <div className="flex items-center gap-2">
                                        <span>{prediction.answer}</span>
                                        <span
                                          className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600"
                                          title="Scrabble Score"
                                        >
                                          {calculateScrabbleScore(prediction.answer)}
                                        </span>
                                      </div>
                                    ) : (
                                      prediction.answer
                                    )
                                  ) : (
                                    <span className="text-gray-400 italic">Hidden</span>
                                  )
                                ) : (
                                  <span className="text-gray-400 italic">No prediction</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                    {/* Actual Results Row - only show published questions */}
                    {gameData.actualResults && hasPublishedQuestions && (
                      <tr className="border-b bg-yellow-50 font-semibold">
                        <td className="p-4">Actual Results</td>
                        {gameData.questions.map((question, qIndex) => {
                          const isPublished = gameData.publishedQuestions.includes(question.text);
                          let actualValue = '';

                          if (isPublished && gameData.actualResults) {
                            // Use question ID as the key in actualResults
                            actualValue = gameData.actualResults[question.id] || '-';
                          }

                          return (
                            <td key={qIndex} className="p-4">
                              {isPublished ? (
                                actualValue ? (
                                  question.type === 'SCRABBLE' ? (
                                    <div className="flex items-center gap-2">
                                      <span>{actualValue}</span>
                                      <span
                                        className="rounded-md bg-yellow-200 px-2 py-0.5 text-xs font-semibold text-yellow-800"
                                        title="Scrabble Score"
                                      >
                                        {calculateScrabbleScore(actualValue)}
                                      </span>
                                    </div>
                                  ) : (
                                    actualValue
                                  )
                                ) : (
                                  '-'
                                )
                              ) : (
                                <span className="text-gray-400 italic">Not published</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
          </CardContent>
        </Card>

        {gameData.participants.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">
                No participants yet. Share the game link to get started!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
