'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    const validValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : normalizedValue;
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
              className={`w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${baseClassName}`}
            >
              <option value="">Select...</option>
              {bet.questionOptions.map((option: string, index: number) => (
                <option key={index} value={option}>{option}</option>
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
              className={`w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${baseClassName}`}
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
              className={`w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${baseClassName}`}
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
              className={`w-16 h-10 p-1 border border-input rounded-md cursor-pointer ${baseClassName}`}
            />
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
      <div className="flex-1 min-w-0">
        <Label htmlFor={bet.id} className="block font-medium flex items-center gap-2">
          {isLocked && (
            <span 
              className="text-red-600 font-semibold cursor-help" 
              title="This question has been locked. Results have been published and predictions can no longer be changed."
            >
              🔒
            </span>
          )}
          {bet.question}
        </Label>
      </div>
      <div className="w-48 flex-shrink-0">
        {renderInput()}
      </div>
    </div>
  );
}