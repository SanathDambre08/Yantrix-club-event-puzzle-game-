import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { Card } from '../components/ui';
import { DynamicQuestion } from '../components/DynamicQuestion';
import { useGame } from '../contexts/GameContext';
import { supabase } from '../lib/supabase';
import { YEAR_OPTIONS, isValidEmail } from '../lib/utils';
import type { CustomQuestion } from '../types';

export function Registration() {
  const navigate = useNavigate();
  const { dispatch } = useGame();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, unknown>>({});

  // Questions
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch active questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_questions')
          .select('*')
          .eq('active', true)
          .order('order_index', { ascending: true });

        if (error) throw error;
        setQuestions(data || []);
      } catch (err) {
        console.error('Failed to fetch questions:', err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleCustomAnswerChange = (questionId: string, value: unknown) => {
    setCustomAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear error for this question
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'College email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!year) newErrors.year = 'Please select your year';

    // Validate required custom questions
    questions.forEach((q) => {
      if (q.required) {
        const answer = customAnswers[q.id];
        if (
          answer === undefined ||
          answer === null ||
          answer === '' ||
          (Array.isArray(answer) && answer.length === 0)
        ) {
          newErrors[q.id] = 'This field is required';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // 1. Create student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          name: name.trim(),
          email: email.trim(),
          course: 'N/A', // Passing default since it is NOT NULL in database
          year: Number(year),
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // 2. Save custom question answers
      if (questions.length > 0) {
        const answersToInsert = questions
          .filter((q) => customAnswers[q.id] !== undefined)
          .map((q) => ({
            student_id: student.id,
            question_id: q.id,
            question_version: q.version,
            question_text_snapshot: q.question_text,
            answer_json: customAnswers[q.id],
          }));

        if (answersToInsert.length > 0) {
          const { error: answersError } = await supabase
            .from('student_answers')
            .insert(answersToInsert);

          if (answersError) throw answersError;
        }
      }

      // 3. Set student in context
      dispatch({ type: 'SET_STUDENT', payload: student });

      // 4. Navigate to pre-game ready screen
      navigate('/ready');
    } catch (err) {
      console.error('Registration failed:', err);
      setSubmitError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12 relative z-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-gradient mb-2 hover-glitch cursor-default">
          Initialization Sequence
        </h1>
        <p className="text-accent/80 font-mono text-sm">
          Awaiting pilot data input...
        </p>
      </div>

      <Card tilt>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Required Profile Fields */}
          <Input
            label="Full Name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: '' }));
            }}
            error={errors.name}
            placeholder="Enter your full name"
            autoFocus
          />

          <Input
            label="College Email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: '' }));
            }}
            error={errors.email}
            placeholder="Enter your college email"
          />

          {/* Year segmented control */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Year <span className="text-danger">*</span>
            </label>
            <div className="flex gap-2">
              {YEAR_OPTIONS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setYear(y);
                    if (errors.year) setErrors((p) => ({ ...p, year: '' }));
                  }}
                  className={`flex-1 py-3 rounded-lg border font-semibold text-base transition-all duration-200
                    ${year === y
                      ? 'border-primary bg-primary text-white shadow-glow-primary'
                      : 'border-border bg-surface-elevated text-text-muted hover:border-border-hover hover:text-text'
                    }`}
                >
                  {y}<sup className="text-[10px] ml-0.5">
                    {y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'}
                  </sup>
                </button>
              ))}
            </div>
            {errors.year && <p className="text-sm text-danger mt-1">{errors.year}</p>}
          </div>

          {/* Dynamic Custom Questions */}
          {isLoadingQuestions ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-5 pt-2 border-t border-border">
              <p className="text-sm text-text-muted font-medium">
                Additional Questions
              </p>
              {questions.map((q) => (
                <DynamicQuestion
                  key={q.id}
                  question={q}
                  value={customAnswers[q.id]}
                  onChange={handleCustomAnswerChange}
                  error={errors[q.id]}
                />
              ))}
            </div>
          ) : null}

          {/* Submit Error */}
          {submitError && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {submitError}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
          >
            Submit & Start Puzzle
          </Button>
        </form>
      </Card>
    </div>
  );
}
