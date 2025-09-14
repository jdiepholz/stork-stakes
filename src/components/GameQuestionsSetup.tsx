'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { defaultQuestions } from '@/lib/questions';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';

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

interface GameQuestionsSetupProps {
  gameId: string;
  userId: string;
  onComplete: (gameId: string) => void;
  onBack: () => void;
  mode?: 'create' | 'edit'; // New prop to determine if we're creating or editing
  existingQuestions?: Question[]; // Existing questions to load when editing
}

export default function GameQuestionsSetup({ gameId, userId, onComplete, onBack, mode = 'create', existingQuestions = [] }: GameQuestionsSetupProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('NUMBER');
  const [newQuestionPlaceholder, setNewQuestionPlaceholder] = useState('');
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && existingQuestions.length > 0) {
      // Load existing questions when in edit mode
      setQuestions(existingQuestions);
    } else {
      // Initialize with default questions when creating
      const initialQuestions: Question[] = defaultQuestions.map((questionData, index) => ({
        text: questionData.text,
        type: questionData.type,
        placeholder: questionData.placeholder || undefined,
        options: questionData.options || undefined,
        order: index + 1,
        isDefault: true
      }));
      setQuestions(initialQuestions);
    }
  }, [mode, existingQuestions]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedQuestions = Array.from(questions);
    const [reorderedItem] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedQuestions = reorderedQuestions.map((q, index) => ({
      ...q,
      order: index + 1
    }));

    setQuestions(updatedQuestions);
  };

  const isQuestionValid = () => {
    if (!newQuestion.trim()) return false;
    
    // Check for duplicate question text
    const isDuplicate = questions.some(q => q.text.toLowerCase().trim() === newQuestion.toLowerCase().trim());
    if (isDuplicate) return false;
    
    if (newQuestionType === 'SELECT') {
      const validOptions = newQuestionOptions.filter(option => option.trim());
      return validOptions.length >= 2;
    }
    
    return true;
  };

  const addCustomQuestion = () => {
    if (!newQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }

    // Check for duplicate question text
    const isDuplicate = questions.some(q => q.text.toLowerCase().trim() === newQuestion.toLowerCase().trim());
    if (isDuplicate) {
      toast.error('A question with this text already exists');
      return;
    }

    // Validate SELECT questions have at least 2 options
    if (newQuestionType === 'SELECT') {
      const validOptions = newQuestionOptions.filter(option => option.trim());
      if (validOptions.length < 2) {
        toast.error('SELECT questions must have at least 2 options');
        return;
      }
    }

    const customQuestion: Question = {
      text: newQuestion.trim(),
      type: newQuestionType,
      placeholder: newQuestionPlaceholder || undefined,
      options: newQuestionType === 'SELECT' ? newQuestionOptions.filter(opt => opt.trim()) : undefined,
      order: questions.length + 1,
      isDefault: false,
      isCustom: true
    };

    setQuestions([...questions, customQuestion]);
    setNewQuestion('');
    setNewQuestionType('NUMBER');
    setNewQuestionPlaceholder('');
    setNewQuestionOptions([]);
    setDialogOpen(false);
    toast.success('Custom question added!');
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = questions
      .filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, order: i + 1 }));
    setQuestions(updatedQuestions);
    toast.success('Question removed!');
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      // Get the final list of questions in the correct order
      const finalQuestions = questions.map((q, index) => ({
        ...q,
        order: index + 1
      }));

      if (mode === 'edit') {
        // In edit mode, we need to update existing questions
        // First, delete all existing questions for this game
        const deleteResponse = await fetch(`/api/games/${gameId}/questions`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!deleteResponse.ok) {
          throw new Error('Failed to clear existing questions');
        }

        // Then recreate all questions in the new order
        for (const question of finalQuestions) {
          const response = await fetch(`/api/games/${gameId}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: question.text,
              type: question.type,
              placeholder: question.placeholder,
              options: question.options,
              createdBy: userId,
              isDefault: question.isDefault,
              order: question.order
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 409) {
              throw new Error(`Duplicate question: "${question.text}" already exists in this game`);
            } else {
              throw new Error(errorData.error || 'Failed to update question');
            }
          }
        }
      } else {
        // Original creation mode logic
        for (const question of finalQuestions) {
          const response = await fetch(`/api/games/${gameId}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: question.text,
              type: question.type,
              placeholder: question.placeholder,
              options: question.options,
              createdBy: userId,
              isDefault: question.isDefault,
              order: question.order
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 409) {
              throw new Error(`Duplicate question: "${question.text}" already exists in this game`);
            } else {
              throw new Error(errorData.error || 'Failed to create question');
            }
          }
        }
      }

      onComplete(gameId);
    } catch (error) {
      console.error('Error setting up questions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error setting up questions. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Game Questions ({questions.length})</span>
            <div className="text-sm text-gray-500">
              Drag to reorder • Click X to remove
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided: DroppableProvided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {questions.map((question, index) => (
                    <Draggable key={`question-${index}`} draggableId={`question-${index}`} index={index}>
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            snapshot.isDragging 
                              ? 'bg-blue-50 border-blue-200 shadow-lg' 
                              : question.isDefault 
                                ? 'bg-gray-50 border-gray-200' 
                                : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="text-sm font-medium text-gray-500 min-w-[24px]">
                              {question.order}.
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{question.text}</div>
                              <div className="text-xs text-gray-500 flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded ${
                                  question.isDefault ? 'bg-gray-200' : 'bg-blue-200'
                                }`}>
                                  {question.type}
                                </span>
                                <span>
                                  {question.isDefault ? 'Default' : 'Custom'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-gray-400 cursor-grab">⋮⋮</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuestion(index)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-4">
                + Add Custom Question
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Question</DialogTitle>
                <DialogDescription>
                  Add a custom question to your game. Participants will be able to make predictions for this question.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Question Text</Label>
                  <Input
                    id="question"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="e.g., What will be the baby's middle name?"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Question Type</Label>
                  <select
                    id="type"
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NUMBER">Number</option>
                    <option value="DATE">Date</option>
                    <option value="TIME">Time</option>
                    <option value="SELECT">Multiple Choice</option>
                    <option value="COLORPICKER">Color Picker</option>
                  </select>
                </div>
                {(newQuestionType !== 'SELECT' && newQuestionType !== 'COLORPICKER') && (
                  <div>
                    <Label htmlFor="placeholder">Placeholder (optional)</Label>
                    <Input
                      id="placeholder"
                      value={newQuestionPlaceholder}
                      onChange={(e) => setNewQuestionPlaceholder(e.target.value)}
                      placeholder={
                        newQuestionType === 'NUMBER' ? 'e.g., Enter a number' :
                        newQuestionType === 'DATE' ? 'e.g., Select a date' :
                        newQuestionType === 'TIME' ? 'e.g., Select a time' :
                        'Enter placeholder text'
                      }
                    />
                  </div>
                )}
                {newQuestionType === 'SELECT' && (
                  <div>
                    <Label htmlFor="options">Options (one per line)</Label>
                    <textarea
                      id="options"
                      value={newQuestionOptions.join('\n')}
                      onChange={(e) => setNewQuestionOptions(e.target.value.split('\n'))}
                      placeholder={`Option 1
Option 2
Option 3`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addCustomQuestion} disabled={!isQuestionValid()}>
                  Add Question
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          {mode === 'edit' ? '← Back to Management' : '← Back to Game Name'}
        </Button>
        <Button onClick={handleComplete} disabled={loading}>
          {loading 
            ? (mode === 'edit' ? 'Updating...' : 'Setting up...') 
            : (mode === 'edit' ? 'Save Changes' : 'Create Game & Continue →')
          }
        </Button>
      </div>
    </div>
  );
}