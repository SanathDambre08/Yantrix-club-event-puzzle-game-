import { useState } from 'react';
import { Download, FileSpreadsheet, Users, MessageSquare, Gamepad2, Database } from 'lucide-react';
import { Button } from '../../components/ui';
import { Card } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import Papa from 'papaparse';

type ExportType = 'students' | 'answers' | 'sessions' | 'combined';

export function Export() {
  const [exporting, setExporting] = useState<ExportType | null>(null);

  const downloadCSV = (data: Record<string, unknown>[], filename: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (type: ExportType) => {
    setExporting(type);

    try {
      switch (type) {
        case 'students': {
          const { data } = await supabase
            .from('students')
            .select('id, name, email, year, created_at')
            .order('created_at');
          if (data) downloadCSV(data, 'students');
          break;
        }
        case 'answers': {
          const { data } = await supabase
            .from('student_answers')
            .select('student_id, question_id, question_text_snapshot, question_version, answer_json, created_at')
            .order('created_at');
          if (data) {
            const formatted = data.map((a) => ({
              ...a,
              answer: JSON.stringify(a.answer_json),
            }));
            downloadCSV(formatted, 'answers');
          }
          break;
        }
        case 'sessions': {
          const { data } = await supabase
            .from('game_sessions')
            .select('id, student_id, puzzle_id, started_at, completed_at, duration_seconds, moves, score, status')
            .order('created_at');
          if (data) downloadCSV(data, 'game_sessions');
          break;
        }
        case 'combined': {
          // 1. Fetch game sessions & students
          const { data: sessionData } = await supabase
            .from('game_sessions')
            .select(`
              id,
              duration_seconds,
              moves,
              score,
              status,
              completed_at,
              students (
                id,
                name,
                email,
                year
              )
            `)
            .eq('status', 'completed')
            .order('score', { ascending: false });

          // 2. Fetch all student answers to embed them
          const { data: answerData } = await supabase
            .from('student_answers')
            .select('student_id, question_text_snapshot, answer_json');

          if (sessionData) {
            const combined = sessionData.map((s: Record<string, unknown>) => {
              const student = s.students as Record<string, unknown> | null;
              
              // Map custom answers for this student
              const studentAnswers = answerData?.filter(a => a.student_id === student?.id) || [];
              const customFields: Record<string, string> = {};
              studentAnswers.forEach(a => {
                // Ensure arrays or objects are stringified for CSV
                customFields[a.question_text_snapshot] = typeof a.answer_json === 'string' 
                  ? a.answer_json 
                  : JSON.stringify(a.answer_json);
              });

              return {
                student_id: student?.id,
                name: student?.name,
                email: student?.email,
                year: student?.year,
                duration_seconds: s.duration_seconds,
                moves: s.moves,
                score: s.score,
                ...customFields, // Expands custom questions into their own columns!
              };
            });
            downloadCSV(combined, 'event_dataset');
          }
          break;
        }
      }
    } catch (err) {
      console.error(`Export failed for ${type}:`, err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const exports = [
    {
      type: 'students' as ExportType,
      title: 'Students',
      desc: 'student_id, name, email, year, created_at',
      icon: <Users size={24} />,
    },
    {
      type: 'answers' as ExportType,
      title: 'Answers',
      desc: 'student_id, question_id, question_text_snapshot, answer, created_at',
      icon: <MessageSquare size={24} />,
    },
    {
      type: 'sessions' as ExportType,
      title: 'Game Sessions',
      desc: 'session_id, student_id, started_at, completed_at, duration, moves, score, status',
      icon: <Gamepad2 size={24} />,
    },
    {
      type: 'combined' as ExportType,
      title: 'Combined Event Dataset',
      desc: 'student_id, name, email, year, score, duration, custom_answers (completed only)',
      icon: <Database size={24} />,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <FileSpreadsheet className="text-primary" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-text">Data Export</h1>
          <p className="text-text-muted text-sm">
            Download CSV files for event analysis
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {exports.map((exp) => (
          <Card key={exp.type}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                {exp.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-text">{exp.title}</h3>
                <p className="text-xs text-text-muted truncate">{exp.desc}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport(exp.type)}
                isLoading={exporting === exp.type}
                icon={<Download size={16} />}
              >
                Export CSV
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-surface-elevated border border-border">
        <p className="text-xs text-text-dim">
          📋 Exports are timestamped and spreadsheet-compatible (CSV/UTF-8). The
          combined dataset is convenient for event analysis; normalized exports
          remain the source of truth.
        </p>
      </div>
    </div>
  );
}
