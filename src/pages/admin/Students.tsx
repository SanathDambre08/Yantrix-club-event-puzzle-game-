import { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { Input, Select } from '../../components/ui';
import { Card, CardHeader } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { formatTime } from '../../lib/scoring';
import { formatDate, COURSE_OPTIONS } from '../../lib/utils';
import type { Student, GameSession } from '../../types';

export function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Record<string, GameSession[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        let query = supabase
          .from('students')
          .select('*')
          .order('created_at', { ascending: false });

        if (courseFilter) query = query.eq('course', courseFilter);
        if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);

        const { data, error } = await query;
        if (error) throw error;
        setStudents(data || []);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [searchTerm, courseFilter]);

  const viewStudentDetails = async (student: Student) => {
    setSelectedStudent(student);

    const { data } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false });

    setSessions((prev) => ({ ...prev, [student.id]: data || [] }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text mb-6">Student Data</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <Select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          placeholder="All Courses"
          options={[
            { value: '', label: 'All Courses' },
            ...COURSE_OPTIONS.map((c) => ({ value: c, label: c })),
          ]}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Student List */}
          <div className={`${selectedStudent ? 'w-1/2' : 'w-full'} transition-all`}>
            <Card>
              <CardHeader
                title="Students"
                subtitle={`${students.length} registered`}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-text-muted font-medium">Name</th>
                      <th className="text-left py-2 text-text-muted font-medium">Course</th>
                      <th className="text-left py-2 text-text-muted font-medium">Year</th>
                      <th className="text-right py-2 text-text-muted font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr
                        key={s.id}
                        className={`border-b border-border/50 cursor-pointer transition-colors
                          ${selectedStudent?.id === s.id ? 'bg-primary/5' : 'hover:bg-surface-elevated'}`}
                        onClick={() => viewStudentDetails(s)}
                      >
                        <td className="py-2 font-medium text-text">{s.name}</td>
                        <td className="py-2 text-text-muted">{s.course}</td>
                        <td className="py-2 text-text-muted">Year {s.year}</td>
                        <td className="py-2 text-right">
                          <button className="text-primary hover:text-primary-hover">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Student Detail Panel */}
          {selectedStudent && (
            <div className="w-1/2">
              <Card>
                <CardHeader
                  title={selectedStudent.name}
                  subtitle={`${selectedStudent.course} • Year ${selectedStudent.year}`}
                  action={
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="text-text-muted hover:text-text text-sm"
                    >
                      Close
                    </button>
                  }
                />
                <p className="text-xs text-text-dim mb-4">
                  Registered: {formatDate(selectedStudent.created_at)}
                </p>

                <h4 className="text-sm font-bold text-text mb-2">Game Sessions</h4>
                {(sessions[selectedStudent.id] || []).length === 0 ? (
                  <p className="text-sm text-text-muted">No game sessions.</p>
                ) : (
                  <div className="space-y-2">
                    {sessions[selectedStudent.id].map((sess) => (
                      <div
                        key={sess.id}
                        className="p-3 rounded-lg bg-surface-elevated border border-border text-sm"
                      >
                        <div className="flex justify-between mb-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium
                              ${sess.status === 'completed'
                                ? 'bg-success/10 text-success'
                                : sess.status === 'abandoned'
                                  ? 'bg-danger/10 text-danger'
                                  : 'bg-warning/10 text-warning'
                              }`}
                          >
                            {sess.status}
                          </span>
                          <span className="text-accent font-bold">
                            {sess.score !== null ? `${sess.score} pts` : '—'}
                          </span>
                        </div>
                        <div className="flex gap-4 text-text-muted text-xs">
                          <span>Time: {formatTime(sess.duration_seconds || 0)}</span>
                          <span>Moves: {sess.moves}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
