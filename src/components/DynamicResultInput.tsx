'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateScrabbleScore } from '@/lib/scoring';

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[] | null;
  placeholder?: string;
  isDefault: boolean;
  order: number;
}

interface DynamicResultInputProps {
  question: Question;
  value: string;
  onChange: (questionText: string, value: string, questionType: string) => void;
  hideLabel?: boolean;
}

export default function DynamicResultInput({
  question,
  value,
  onChange,
  hideLabel = false,
}: DynamicResultInputProps) {
  const { text, type, placeholder, options } = question;

  const renderInput = () => {
    switch (type) {
      case 'DATE':
        return (
          <Input
            id={`result-${text}`}
            type="date"
            value={value}
            onChange={(e) => onChange(text, e.target.value, type)}
          />
        );

      case 'TIME':
        return (
          <Input
            id={`result-${text}`}
            type="time"
            value={value}
            onChange={(e) => onChange(text, e.target.value, type)}
          />
        );

      case 'NUMBER':
        return (
          <Input
            id={`result-${text}`}
            type="number"
            value={value}
            onChange={(e) => onChange(text, e.target.value, type)}
            placeholder={placeholder || 'Enter a number'}
          />
        );

      case 'SELECT':
        return (
          <select
            id={`result-${text}`}
            value={value}
            onChange={(e) => onChange(text, e.target.value, type)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select...</option>
            {options &&
              Array.isArray(options) &&
              options.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
        );

      case 'COLORPICKER':
        return (
          <div className="flex items-center space-x-3">
            <Input
              id={`result-${text}`}
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(text, e.target.value, type)}
              className="h-10 w-16 cursor-pointer rounded-md border border-gray-300 p-1"
            />
          </div>
        );

      case 'SCRABBLE':
        return (
          <div className="flex items-center space-x-2">
            <Input
              id={`result-${text}`}
              value={value}
              onChange={(e) => onChange(text, e.target.value, type)}
              placeholder={placeholder || ''}
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
            id={`result-${text}`}
            value={value}
            onChange={(e) => onChange(text, e.target.value, type)}
            placeholder={placeholder || ''}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {!hideLabel && <Label htmlFor={`result-${text}`}>{text}</Label>}
      {renderInput()}
    </div>
  );
}
