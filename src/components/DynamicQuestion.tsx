import { Input, Select, Textarea } from './ui';
import type { CustomQuestion } from '../types';

interface DynamicQuestionProps {
  question: CustomQuestion;
  value: unknown;
  onChange: (questionId: string, value: unknown) => void;
  error?: string;
}

/**
 * Renders a custom question based on its type.
 * PRD §6.3: Supports short text, long text, single choice, multiple choice,
 * yes/no, rating, and dropdown.
 */
export function DynamicQuestion({
  question,
  value,
  onChange,
  error,
}: DynamicQuestionProps) {
  const handleChange = (newValue: unknown) => {
    onChange(question.id, newValue);
  };

  switch (question.type) {
    case 'short_text':
      return (
        <Input
          label={question.question_text}
          required={question.required}
          value={(value as string) || ''}
          onChange={(e) => handleChange(e.target.value)}
          error={error}
          placeholder="Your answer..."
        />
      );

    case 'long_text':
      return (
        <Textarea
          label={question.question_text}
          required={question.required}
          value={(value as string) || ''}
          onChange={(e) => handleChange(e.target.value)}
          error={error}
          placeholder="Your detailed answer..."
          rows={3}
        />
      );

    case 'single_choice':
      return (
        <div className="w-full">
          <label className="block text-sm font-medium text-text mb-2">
            {question.question_text}
            {question.required && <span className="text-danger ml-0.5">*</span>}
          </label>
          <div className="flex flex-col gap-2">
            {question.options?.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                  ${value === option
                    ? 'border-primary bg-primary/10 text-text'
                    : 'border-border bg-surface-elevated hover:border-border-hover text-text-muted'
                  }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={() => handleChange(option)}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-sm text-danger mt-1">{error}</p>}
        </div>
      );

    case 'multiple_choice':
      return (
        <div className="w-full">
          <label className="block text-sm font-medium text-text mb-2">
            {question.question_text}
            {question.required && <span className="text-danger ml-0.5">*</span>}
          </label>
          <div className="flex flex-col gap-2">
            {question.options?.map((option) => {
              const selected = Array.isArray(value) && value.includes(option);
              return (
                <label
                  key={option}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                    ${selected
                      ? 'border-primary bg-primary/10 text-text'
                      : 'border-border bg-surface-elevated hover:border-border-hover text-text-muted'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {
                      const current = Array.isArray(value) ? [...value] : [];
                      if (selected) {
                        handleChange(current.filter((v: string) => v !== option));
                      } else {
                        handleChange([...current, option]);
                      }
                    }}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              );
            })}
          </div>
          {error && <p className="text-sm text-danger mt-1">{error}</p>}
        </div>
      );

    case 'yes_no':
      return (
        <div className="w-full">
          <label className="block text-sm font-medium text-text mb-2">
            {question.question_text}
            {question.required && <span className="text-danger ml-0.5">*</span>}
          </label>
          <div className="flex gap-3">
            {['Yes', 'No'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleChange(option)}
                className={`flex-1 py-3 rounded-lg border font-medium transition-all duration-200
                  ${value === option
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface-elevated text-text-muted hover:border-border-hover'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-danger mt-1">{error}</p>}
        </div>
      );

    case 'rating':
      return (
        <div className="w-full">
          <label className="block text-sm font-medium text-text mb-2">
            {question.question_text}
            {question.required && <span className="text-danger ml-0.5">*</span>}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleChange(rating)}
                className={`w-12 h-12 rounded-lg border font-bold text-lg transition-all duration-200
                  ${value === rating
                    ? 'border-primary bg-primary text-white shadow-glow-primary'
                    : 'border-border bg-surface-elevated text-text-muted hover:border-border-hover hover:text-text'
                  }`}
              >
                {rating}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-danger mt-1">{error}</p>}
        </div>
      );

    case 'dropdown':
      return (
        <Select
          label={question.question_text}
          required={question.required}
          value={(value as string) || ''}
          onChange={(e) => handleChange(e.target.value)}
          error={error}
          placeholder="Select an option..."
          options={
            question.options?.map((opt) => ({ value: opt, label: opt })) || []
          }
        />
      );

    default:
      return (
        <div className="text-text-muted text-sm">
          Unsupported question type: {question.type}
        </div>
      );
  }
}
