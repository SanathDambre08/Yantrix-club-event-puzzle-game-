import { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  X,
} from 'lucide-react';
import { Button, Input, Select } from '../../components/ui';
import { Card, CardHeader } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import type { CustomQuestion, QuestionType } from '../../types';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'short_text', label: 'Short Text' },
  { value: 'long_text', label: 'Long Text' },
  { value: 'single_choice', label: 'Single Choice' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'rating', label: 'Rating (1-5)' },
  { value: 'dropdown', label: 'Dropdown' },
];

export function Questions() {
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formText, setFormText] = useState('');
  const [formType, setFormType] = useState<QuestionType>('short_text');
  const [formOptions, setFormOptions] = useState('');
  const [formRequired, setFormRequired] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_questions')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const resetForm = () => {
    setFormText('');
    setFormType('short_text');
    setFormOptions('');
    setFormRequired(false);
    setEditingId(null);
    setShowForm(false);
    setFormError('');
  };

  const handleEdit = (q: CustomQuestion) => {
    setFormText(q.question_text);
    setFormType(q.type);
    setFormOptions(q.options?.join(', ') || '');
    setFormRequired(q.required);
    setEditingId(q.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formText.trim()) {
      setFormError('Question text is required');
      return;
    }

    setFormSaving(true);
    setFormError('');

    const needsOptions = ['single_choice', 'multiple_choice', 'dropdown'].includes(formType);
    const options = needsOptions
      ? formOptions.split(',').map((o) => o.trim()).filter(Boolean)
      : null;

    if (needsOptions && (!options || options.length < 2)) {
      setFormError('Please provide at least 2 options (comma separated)');
      setFormSaving(false);
      return;
    }

    try {
      if (editingId) {
        // Update — increment version
        const existing = questions.find((q) => q.id === editingId);
        const { error } = await supabase
          .from('custom_questions')
          .update({
            question_text: formText.trim(),
            type: formType,
            options,
            required: formRequired,
            version: (existing?.version || 1) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase.from('custom_questions').insert({
          question_text: formText.trim(),
          type: formType,
          options,
          required: formRequired,
          active: true,
          order_index: questions.length,
          version: 1,
        });

        if (error) throw error;
      }

      resetForm();
      fetchQuestions();
    } catch (err) {
      setFormError('Failed to save question. Please try again.');
      console.error(err);
    } finally {
      setFormSaving(false);
    }
  };

  const toggleActive = async (q: CustomQuestion) => {
    try {
      await supabase
        .from('custom_questions')
        .update({ active: !q.active, updated_at: new Date().toISOString() })
        .eq('id', q.id);
      fetchQuestions();
    } catch (err) {
      console.error('Failed to toggle question:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question? Historical answers will be preserved.')) return;
    try {
      await supabase.from('custom_questions').delete().eq('id', id);
      fetchQuestions();
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Question Manager</h1>
          <p className="text-text-muted text-sm">
            {questions.length} question{questions.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          icon={<Plus size={18} />}
        >
          Add Question
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-6 border-primary/30">
          <CardHeader
            title={editingId ? 'Edit Question' : 'New Question'}
            action={
              <button onClick={resetForm} className="text-text-muted hover:text-text">
                <X size={20} />
              </button>
            }
          />
          <div className="space-y-4">
            <Input
              label="Question Text"
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              required
              placeholder="e.g., What areas of robotics interest you?"
            />
            <Select
              label="Question Type"
              value={formType}
              onChange={(e) => setFormType(e.target.value as QuestionType)}
              options={QUESTION_TYPES}
            />
            {['single_choice', 'multiple_choice', 'dropdown'].includes(formType) && (
              <Input
                label="Options (comma separated)"
                value={formOptions}
                onChange={(e) => setFormOptions(e.target.value)}
                required
                placeholder="e.g., AI/ML, Robotics, IoT, Drones"
              />
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formRequired}
                onChange={(e) => setFormRequired(e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm text-text">Required</span>
            </label>
            {formError && (
              <p className="text-sm text-danger">{formError}</p>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSave} isLoading={formSaving} icon={<Save size={16} />}>
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text-muted">No questions configured yet.</p>
          <p className="text-text-dim text-sm mt-1">
            Add custom questions to collect student interests.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card
              key={q.id}
              className={`${!q.active ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-text-dim mt-1 cursor-grab">
                  <GripVertical size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-text-dim">#{i + 1}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${q.active
                          ? 'bg-success/10 text-success'
                          : 'bg-text-dim/10 text-text-dim'
                        }`}
                    >
                      {q.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {QUESTION_TYPES.find((t) => t.value === q.type)?.label}
                    </span>
                    {q.required && (
                      <span className="text-xs text-danger font-medium">Required</span>
                    )}
                    <span className="text-xs text-text-dim">v{q.version}</span>
                  </div>
                  <p className="text-text font-medium">{q.question_text}</p>
                  {q.options && (
                    <p className="text-xs text-text-muted mt-1">
                      Options: {q.options.join(' · ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(q)}
                    className="p-2 rounded-lg hover:bg-surface-elevated text-text-muted hover:text-text transition-colors"
                    title={q.active ? 'Deactivate' : 'Activate'}
                  >
                    {q.active ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => handleEdit(q)}
                    className="p-2 rounded-lg hover:bg-surface-elevated text-text-muted hover:text-text transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
