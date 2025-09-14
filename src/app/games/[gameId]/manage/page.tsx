'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { calculateParticipantScores, getLeaderboard } from '@/lib/scoring';
import DynamicResultInput from '@/components/DynamicResultInput';

interface GameData {
  id: string;
  name: string;
  status: string;
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

export default function ManageGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [actualResults, setActualResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({ open: false });
  const [publishDialog, setPublishDialog] = useState({ open: false, question: '', questions: [] as string[] });
  const [missingResultDialog, setMissingResultDialog] = useState({ open: false, question: '' });

  // Generic input handlers
  const handleResultChange = (questionText: string, value: string, questionType: string) => {
    // Find the question object to get the ID
    const question = gameData?.questions.find(q => q.text === questionText);
    if (!question) return;
    
    if (questionType === 'NUMBER') {
      // Only allow positive numbers
      const cleanValue = value.replace(/[^0-9,.]/, '');
      const normalizedValue = cleanValue.replace(',', '.');
      const parts = normalizedValue.split('.');
      const validValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : normalizedValue;
      setActualResults(prev => ({ ...prev, [question.id]: validValue }));
    } else {
      setActualResults(prev => ({ ...prev, [question.id]: value }));
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userId || !userEmail) {
      router.push(`/auth?redirect=/games/${gameId}/manage`);
      return;
    }

    setUser({ id: userId, email: userEmail });
  }, [router, gameId]);

  useEffect(() => {
    if (gameId && user) {
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
          // Initialize actual results state based on game questions
          if (data.actualResults && data.questions) {
            const results: Record<string, string> = {};
            data.questions.forEach((question: { id: string; text: string; type: string }) => {
              results[question.id] = data.actualResults?.[question.id] || '';
            });
            setActualResults(results);
          } else if (data.questions) {
            // Initialize empty results for all questions
            const results: Record<string, string> = {};
            data.questions.forEach((question: { id: string; text: string; type: string }) => {
              results[question.id] = '';
            });
            setActualResults(results);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching game data:', error);
          toast.error('You are not authorized to manage this game or it does not exist.');
          router.push('/dashboard');
        });
    }
  }, [gameId, user, router]);

  // const handleSaveResults = async () => {
  //   if (!user || !gameData) return;

  //   try {
  //     const response = await fetch(`/api/games/${gameId}/actual-results`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': user.id,
  //       },
  //       body: JSON.stringify(actualResults),
  //     });

  //     if (response.ok) {
  //       toast.success('Actual results saved successfully!');
  //       // Refresh game data
  //       window.location.reload();
  //     } else {
  //       toast.error('Failed to save results.');
  //     }
  //   } catch (error) {
  //     console.error('Error saving results:', error);
  //     toast.error('Failed to save results.');
  //   }
  // };

  const handleSaveQuestion = async (_questionId: string) => {
    if (!user || !gameData) return;

    try {
      // Merge the current question's result with existing results
      const allResults = { ...actualResults };
      const response = await fetch(`/api/games/${gameId}/actual-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.id,
        },
        body: JSON.stringify(allResults),
      });

      if (response.ok) {
        toast.success('Result saved!');
        // Refresh game data
        window.location.reload();
      } else {
        toast.error('Failed to save result.');
      }
    } catch (error) {
      console.error('Error saving result:', error);
      toast.error('Failed to save result.');
    }
  };

  const handleQuickPublish = async (question: string) => {
    if (!user || !gameData) return;

    // Find the question to get its ID
    const questionObj = gameData.questions.find(q => q.text === question);
    if (!questionObj) return;

    // Check if actual result exists for this question
    const hasActualResult = actualResults[questionObj.id] && actualResults[questionObj.id].trim() !== '';

    if (!hasActualResult) {
      setMissingResultDialog({ open: true, question });
      return;
    }

    try {
      // First, save the result (merge with existing results)
      const allResults = { ...actualResults };
      const saveResponse = await fetch(`/api/games/${gameId}/actual-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.id,
        },
        body: JSON.stringify(allResults),
      });

      if (!saveResponse.ok) {
        toast.error('Failed to save result before publishing.');
        return;
      }

      // Then proceed with publishing
      setPublishDialog({ open: true, question, questions: [question] });
    } catch (error) {
      console.error('Error saving result before publishing:', error);
      toast.error('Failed to save result before publishing.');
    }
  };

  const handleUnpublish = async (question: string) => {
    if (!user || !gameData) return;

    try {
      const response = await fetch(`/api/games/${gameId}/publish-questions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.id,
        },
        body: JSON.stringify({ questions: [question] }),
      });

      if (response.ok) {
        toast.success('Question unpublished!');
        // Refresh game data
        window.location.reload();
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Unknown error';
        } catch (_jsonError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || 'Unknown error';
        }
        toast.error(`Failed to unpublish: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error unpublishing question:', error);
      toast.error('Failed to unpublish question.');
    }
  };

  const handlePublishAllReady = async () => {
    if (!user || !gameData) return;

    // Find all questions that have results but are not published
    const readyToPublish = gameData.questions.filter(question => {
      const hasActualResult = actualResults[question.id] && actualResults[question.id].trim() !== '';
      const isNotPublished = !gameData.publishedQuestions.includes(question.text);
      return hasActualResult && isNotPublished;
    });

    if (readyToPublish.length === 0) {
      toast.error('No questions are ready to publish. Enter results first.');
      return;
    }

    try {
      // First, save all current results
      const saveResponse = await fetch(`/api/games/${gameId}/actual-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.id,
        },
        body: JSON.stringify(actualResults),
      });

      if (!saveResponse.ok) {
        toast.error('Failed to save results before publishing.');
        return;
      }

      // Then publish all ready questions
      const questionsToPublish = readyToPublish.map(q => q.text);
      const publishResponse = await fetch(`/api/games/${gameId}/publish-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.id,
        },
        body: JSON.stringify({ questions: questionsToPublish }),
      });

      if (publishResponse.ok) {
        toast.success(`Successfully published ${questionsToPublish.length} question(s)!`);
        // Refresh game data
        window.location.reload();
      } else {
        const errorData = await publishResponse.json();
        toast.error(`Failed to publish questions: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error publishing all ready questions:', error);
      toast.error('Failed to publish questions.');
    }
  };

  const confirmQuickPublish = async () => {
    // Store the question before clearing the dialog state
    // Use questions[0] since this works for both quick publish and single-item bulk publish
    const questionToPublish = publishDialog.questions[0] || publishDialog.question;
    setPublishDialog({ open: false, question: '', questions: [] });

    if (!questionToPublish) {
      toast.error('No question selected to publish.');
      return;
    }

    try {
      const response = await fetch(`/api/games/${gameId}/publish-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user!.id,
        },
        body: JSON.stringify({ questions: [questionToPublish] }),
      });

      if (response.ok) {
        toast.success(`Successfully published "${questionToPublish}"!`);
        // Refresh game data
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to publish question: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error publishing question:', error);
      toast.error('Failed to publish question.');
    }
  };

  const handleDeleteGame = async () => {
    if (!user || !gameData) return;
    setDeleteDialog({ open: true });
  };

  const confirmDeleteGame = async () => {
    setDeleteDialog({ open: false });

    try {
      const response = await fetch(`/api/games/${gameId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': user!.id,
        },
      });

      if (response.ok) {
        toast.success('Game successfully deleted!');
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete game: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game.');
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

  // Calculate scores for published questions
  const participantScores = gameData.actualResults && gameData.publishedQuestions.length > 0
    ? calculateParticipantScores(
        gameData.participants, 
        gameData.actualResults, 
        gameData.questions.filter(q => gameData.publishedQuestions.includes(q.text))
      )
    : [];
  const leaderboard = getLeaderboard(participantScores);
  const hasNumericalScoring = leaderboard.length > 0;

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage: {gameData.name}</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => router.push(`/games/${gameId}/questions`)}>
              ✏️ Edit Questions
            </Button>
            <Button variant="outline" onClick={() => router.push(`/games/${gameId}/overview`)}>
              View Overview
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="destructive" onClick={handleDeleteGame}>
              Delete Game
            </Button>
          </div>
        </div>

        {/* Game Info Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div><strong>Status:</strong> {gameData.status === 'RESULTS_PUBLISHED' ? 'Results Published' : 'Active'}</div>
              <div><strong>Participants:</strong> {gameData.participants.length}</div>
              <div><strong>Published:</strong> {gameData.publishedQuestions?.length || 0} of {gameData.questions?.length || 0} questions</div>
              <div><strong>ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{gameData.id}</code></div>
            </div>
          </CardContent>
        </Card>

        {/* Unified Question Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Question Results & Publishing</CardTitle>
                <CardDescription>
                  Enter actual results and publish questions all in one place. Questions turn green when ready to publish.
                </CardDescription>
              </div>
              <Button
                onClick={handlePublishAllReady}
                className="ml-4"
                disabled={!gameData.questions.some(q => 
                  actualResults[q.id] && actualResults[q.id].trim() !== '' && 
                  !gameData.publishedQuestions.includes(q.text)
                )}
              >
                🚀 Publish All Ready
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Question List */}
              <div className="space-y-3">
                {gameData.questions.map((question) => {
                  const isPublished = gameData.publishedQuestions.includes(question.text);
                  const hasActualResult = actualResults[question.id] && actualResults[question.id].trim() !== '';
                  
                  return (
                    <div key={question.id} className={`border rounded-lg p-3 ${isPublished ? 'bg-green-50 border-green-200' : hasActualResult ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        {/* Status Icon */}
                        <span className="text-lg flex-shrink-0">
                          {isPublished ? '✅' : hasActualResult ? '🟢' : '⚪'}
                        </span>

                        {/* Question Text */}
                        <div className="flex-1 min-w-0">
                          <Label className={`font-medium ${isPublished ? 'text-green-700' : ''} block truncate`}>
                            {question.text}
                          </Label>
                        </div>

                        {/* Result Input */}
                        <div className="w-40 flex-shrink-0">
                          <DynamicResultInput
                            question={question}
                            value={actualResults[question.id] || ''}
                            onChange={handleResultChange}
                            hideLabel={true}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveQuestion(question.id)}
                            className="px-2"
                          >
                            💾
                          </Button>
                          {!isPublished ? (
                            <Button
                              size="sm"
                              onClick={() => handleQuickPublish(question.text)}
                              disabled={!hasActualResult}
                              className="px-2"
                            >
                              🚀
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleUnpublish(question.text)}
                              className="px-2"
                            >
                              🔄
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Success Message */}
              {(gameData.publishedQuestions?.length || 0) === (gameData.questions?.length || 0) && (gameData.questions?.length || 0) > 0 && (
                <div className="p-4 bg-green-50 text-green-800 rounded-lg text-center">
                  <div className="text-lg font-semibold">🎉 All Questions Published!</div>
                  <p className="text-sm mt-1">All participants can now see the complete results.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Participant Predictions (Collapsible) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              All Participant Predictions
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const table = document.getElementById('predictions-table');
                  if (table) {
                    table.style.display = table.style.display === 'none' ? 'block' : 'none';
                  }
                }}
              >
                Toggle View
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div id="predictions-table" className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Participant</th>
                    {gameData.questions.map((question, index) => (
                      <th key={index} className="text-left p-3 font-medium max-w-32">
                        <div className="truncate" title={question.text}>
                          {question.text.length > 20 ? question.text.substring(0, 17) + '...' : question.text}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gameData.participants.map((participant) => (
                    <tr key={participant.userId} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">
                        {participant.userName || participant.userEmail}
                      </td>
                      {gameData.questions.map((question, qIndex) => {
                        const prediction = participant.predictions.find(
                          p => p.question === question.text
                        );
                        return (
                          <td key={qIndex} className="p-3">
                            {prediction?.answer || (
                              <span className="text-gray-400 italic">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Actual Results Row */}
                  {gameData.actualResults && (
                    <tr className="border-b bg-yellow-50 font-semibold">
                      <td className="p-3">📊 Actual Results</td>
                      {gameData.questions.map((question, qIndex) => {
                        const actualValue = actualResults[question.id] || '-';
                        return (
                          <td key={qIndex} className="p-3">{actualValue}</td>
                        );
                      })}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Section */}
        {hasNumericalScoring && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                🏆 Scoring & Leaderboard
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const breakdown = document.getElementById('score-breakdown');
                    if (breakdown) {
                      breakdown.style.display = breakdown.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                >
                  Toggle Details
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Compact Leaderboard */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex flex-wrap gap-4">
                    {leaderboard.slice(0, 5).map((participant, index) => (
                      <div 
                        key={participant.userId}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
                          index === 0 ? 'bg-yellow-200 font-bold' : 'bg-white'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-gray-600 text-white text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="truncate max-w-24">
                          {participant.userName || participant.userEmail}
                        </span>
                        <span className="font-mono">{participant.totalScore.toFixed(2)}</span>
                      </div>
                    ))}
                    {leaderboard.length > 5 && (
                      <span className="text-gray-500 text-sm self-center">
                        +{leaderboard.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Detailed Breakdown (Initially Hidden) */}
                <div id="score-breakdown" style={{ display: 'none' }} className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Scoring:</strong> For each question, your score = your_difference ÷ max_difference among all participants. 
                      Lower total scores are better. Missing answers get the worst score (1.0).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {leaderboard.map((participant) => (
                      <div key={participant.userId} className="border rounded p-3 text-sm">
                        <div className="font-medium mb-2 flex justify-between">
                          <span>{participant.userName || participant.userEmail}</span>
                          <span className="font-bold">{participant.totalScore.toFixed(2)}</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          {participant.questionScores
                            .filter(q => q.isNumerical)
                            .map((score, idx) => (
                              <div key={idx} className="flex justify-between font-mono">
                                <span className="truncate max-w-32" title={score.question}>
                                  {score.question.length > 25 ? score.question.substring(0, 22) + '...' : score.question}
                                </span>
                                <span>{score.score.toFixed(2)}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Game</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{gameData?.name}&quot;? 
              This will hide the game from all users, but the data will be preserved. 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteGame}>
              Delete Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={publishDialog.open} onOpenChange={(open) => setPublishDialog({ ...publishDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Question</DialogTitle>
            <DialogDescription>
              Publish &quot;{publishDialog.questions[0] || publishDialog.question}&quot;? This will lock all predictions for this question and show the actual result to participants.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishDialog({ open: false, question: '', questions: [] })}>
              Cancel
            </Button>
            <Button onClick={confirmQuickPublish}>
              Publish Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={missingResultDialog.open} onOpenChange={(open) => setMissingResultDialog({ ...missingResultDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Missing Actual Result</DialogTitle>
            <DialogDescription>
              Please enter the actual result for &quot;{missingResultDialog.question}&quot; before publishing.
              You can add the actual results in the form above.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setMissingResultDialog({ open: false, question: '' })}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </main>
  );
}