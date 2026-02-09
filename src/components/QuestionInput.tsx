'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateScrabbleScore } from '@/lib/scoring';

interface BetWithQuestionInfo {
  id: string;
  question: string;
  answer: string | null;
  questionType: string;
  questionOptions: string[] | null;
  questionPlaceholder?: string;
}

interface QuestionInputProps {
  bet: BetWithQuestionInfo;
  value: string;
  onChange: (betId: string, value: string) => void;
  isLocked: boolean;
}

export default function QuestionInput({ bet, value, onChange, isLocked }: QuestionInputProps) {
  const handleWeightChange = (betId: string, inputValue: string) => {
    const cleanValue = inputValue.replace(/[^0-9,.]/, '');
    const normalizedValue = cleanValue.replace(',', '.');
    const parts = normalizedValue.split('.');
    const validValue =
      parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : normalizedValue;
    onChange(betId, validValue);
  };

  const getPlaceholder = () => {
    // Use database placeholder if available, otherwise fall back to old logic
    if (bet.questionPlaceholder) {
      return bet.questionPlaceholder;
    }

    return '';
  };

  const renderInput = () => {
    const baseClassName = `${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`;

    switch (bet.questionType) {
      case 'DATE':
        return (
          <Input
            id={bet.id}
            type="date"
            value={value}
            onChange={(e) => onChange(bet.id, e.target.value)}
            disabled={isLocked}
            className={baseClassName}
          />
        );

      case 'TIME':
        return (
          <Input
            id={bet.id}
            type="time"
            value={value}
            onChange={(e) => onChange(bet.id, e.target.value)}
            disabled={isLocked}
            className={baseClassName}
          />
        );

      case 'NUMBER':
        if (bet.question.includes('Weight')) {
          return (
            <Input
              id={bet.id}
              value={value}
              onChange={(e) => handleWeightChange(bet.id, e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isLocked}
              className={baseClassName}
            />
          );
        } else {
          return (
            <Input
              id={bet.id}
              type="number"
              value={value}
              onChange={(e) => onChange(bet.id, e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isLocked}
              className={baseClassName}
            />
          );
        }

      case 'SELECT':
        // Use database options if available, otherwise fall back to hardcoded logic
        if (bet.questionOptions && Array.isArray(bet.questionOptions)) {
          return (
            <select
              id={bet.id}
              value={value}
              onChange={(e) => onChange(bet.id, e.target.value)}
              disabled={isLocked}
              className={`border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none ${baseClassName}`}
            >
              <option value="">Select...</option>
              {bet.questionOptions.map((option: string, index: number) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }

        // Fallback for legacy questions without proper options
        if (bet.question === 'Sex of the Baby') {
          return (
            <select
              id={bet.id}
              value={value}
              onChange={(e) => onChange(bet.id, e.target.value)}
              disabled={isLocked}
              className={`border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none ${baseClassName}`}
            >
              <option value="">Select...</option>
              <option value="Boy">Boy</option>
              <option value="Girl">Girl</option>
              <option value="Diverse">Diverse</option>
            </select>
          );
        } else {
          // Generic fallback
          return (
            <select
              id={bet.id}
              value={value}
              onChange={(e) => onChange(bet.id, e.target.value)}
              disabled={isLocked}
              className={`border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none ${baseClassName}`}
            >
              <option value="">Select...</option>
            </select>
          );
        }

      case 'COLORPICKER':
        return (
          <div className="flex items-center space-x-3">
            <Input
              id={bet.id}
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(bet.id, e.target.value)}
              disabled={isLocked}
              className={`border-input h-10 w-16 cursor-pointer rounded-md border p-1 ${baseClassName}`}
            />
          </div>
        );

      case 'SCRABBLE':
        return (
          <div className="flex items-center space-x-2">
            <Input
              id={bet.id}
              value={value}
              onChange={(e) => onChange(bet.id, e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isLocked}
              className={`flex-1 ${baseClassName}`}
            />
            <div 
              className="flex h-10 min-w-[3rem] items-center justify-center rounded-md border bg-gray-50 px-2 text-sm font-semibold text-gray-600"
              title="Scrabble Score"
            >
              {calculateScrabbleScore(value)}
            </div>
          </div>
        );

      default:
        return (
          <Input
            id={bet.id}
            value={value}
            onChange={(e) => onChange(bet.id, e.target.value)}
            placeholder={getPlaceholder()}
            disabled={isLocked}
            className={baseClassName}
          />
        );
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <Label htmlFor={bet.id} className="block flex items-center gap-2 font-medium">
          {isLocked && (
            <span
              className="cursor-help font-semibold text-red-600"
              title="This question has been locked. Results have been published and predictions can no longer be changed."
            >
              🔒
            </span>
          )}
          {bet.question}
        </Label>
      </div>
      <div className="w-48 flex-shrink-0">{renderInput()}</div>
    </div>
  );
}
