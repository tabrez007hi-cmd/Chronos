import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { SubjectItem, SubjectColor, DeepWorkSession } from '../types';
import { COLOR_PALETTES } from '../utils/storage';

interface SubjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectItem[];
  onUpdateSubjects: (subjects: SubjectItem[]) => void;
  activeSubject: string;
  onSelectActiveSubject: (name: string) => void;
  sessions: DeepWorkSession[];
}

const AVAILABLE_COLORS: { name: SubjectColor; label: string }[] = [
  { name: 'blue', label: 'Blue' },
  { name: 'cyan', label: 'Cyan' },
  { name: 'emerald', label: 'Emerald' },
  { name: 'violet', label: 'Violet' },
  { name: 'amber', label: 'Amber' },
  { name: 'rose', label: 'Rose' },
  { name: 'indigo', label: 'Indigo' },
  { name: 'orange', label: 'Orange' },
  { name: 'teal', label: 'Teal' },
];

export const SubjectManagerModal: React.FC<SubjectManagerModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onUpdateSubjects,
  activeSubject,
  onSelectActiveSubject,
  sessions,
}) => {
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [newSubjectColor, setNewSubjectColor] = useState<SubjectColor>('blue');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editColor, setEditColor] = useState<SubjectColor>('blue');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmed = newSubjectName.trim();
    if (!trimmed) return;

    if (subjects.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('A subject with this name already exists.');
      return;
    }

    const newSub: SubjectItem = {
      id: `sub-${Date.now()}`,
      name: trimmed,
      color: newSubjectColor,
    };

    const updated = [...subjects, newSub];
    onUpdateSubjects(updated);
    setNewSubjectName('');
    onSelectActiveSubject(trimmed);
  };

  const startEdit = (sub: SubjectItem) => {
    setEditingId(sub.id);
    setEditName(sub.name);
    setEditColor(sub.color);
    setErrorMsg(null);
  };

  const saveEdit = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;

    if (subjects.some((s) => s.id !== id && s.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('A subject with this name already exists.');
      return;
    }

    const updated = subjects.map((s) =>
      s.id === id ? { ...s, name: trimmed, color: editColor } : s
    );
    onUpdateSubjects(updated);
    if (activeSubject === subjects.find((s) => s.id === id)?.name) {
      onSelectActiveSubject(trimmed);
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (subjects.length <= 1) {
      setErrorMsg('You must have at least one subject.');
      return;
    }

    const updated = subjects.filter((s) => s.id !== id);
    onUpdateSubjects(updated);

    if (activeSubject === name) {
      onSelectActiveSubject(updated[0]?.name || 'General');
    }
  };

  const getSubjectMinutes = (subjectName: string) => {
    return sessions
      .filter((s) => s.subject.toLowerCase() === subjectName.toLowerCase())
      .reduce((acc, s) => acc + s.durationMinutes, 0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[92dvh] overflow-y-auto ch-glass-modal rounded-3xl p-5 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b ch-border pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 ch-text-accent" />
            <h3 className="text-base font-bold ch-text">Manage Study Subjects</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 ch-text-muted hover:ch-text rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Add New Subject Form */}
        <form onSubmit={handleAddSubject} className="p-3.5 rounded-2xl ch-glass-subtle space-y-3">
          <div className="text-xs font-semibold ch-text-secondary">Create New Course / Subject</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="e.g. Organic Chemistry, Greek Philosophy..."
              className="flex-1 px-3 py-1.5 text-xs ch-input rounded-xl"
            />
            <button
              type="submit"
              className="px-3 py-1.5 ch-btn-primary text-xs rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] ch-text-muted mr-1">Color:</span>
            {AVAILABLE_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setNewSubjectColor(c.name)}
                className={`w-5 h-5 rounded-full ${COLOR_PALETTES[c.name].solidBg} transition-transform cursor-pointer ${
                  newSubjectColor === c.name ? 'ring-2 ring-amber-400 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </form>

        {/* Existing Subjects List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {subjects.map((sub) => {
            const isEditing = editingId === sub.id;
            const palette = COLOR_PALETTES[sub.color] || COLOR_PALETTES.blue;
            const totalMins = getSubjectMinutes(sub.name);
            const totalHrs = (totalMins / 60).toFixed(1);
            const isCurrentActive = activeSubject.toLowerCase() === sub.name.toLowerCase();

            if (isEditing) {
              return (
                <div key={sub.id} className="p-3 rounded-xl ch-glass-subtle space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs ch-input rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(sub.id)}
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 text-xs ch-text-muted hover:ch-text cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {AVAILABLE_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setEditColor(c.name)}
                        className={`w-4 h-4 rounded-full ${COLOR_PALETTES[c.name].solidBg} cursor-pointer ${
                          editColor === c.name ? 'ring-2 ring-amber-400 scale-110' : 'opacity-60'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 rounded-xl ch-glass-subtle transition-colors"
                style={
                  isCurrentActive
                    ? {
                        borderColor: 'var(--ch-accent-border)',
                        backgroundColor: 'var(--ch-accent-soft)',
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-3 h-3 rounded-full ${palette.solidBg} shrink-0`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold ch-text truncate">{sub.name}</span>
                      {isCurrentActive && (
                        <span className="text-[10px] ch-text-accent font-bold">· Active</span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono ch-text-muted tabular-nums">
                      {totalHrs}h logged
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isCurrentActive && (
                    <button
                      type="button"
                      onClick={() => onSelectActiveSubject(sub.name)}
                      className="px-2.5 py-1 text-[11px] font-medium ch-btn-secondary rounded-md cursor-pointer"
                    >
                      Select
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(sub)}
                    className="p-1.5 ch-text-muted hover:ch-text rounded transition-colors cursor-pointer"
                    title="Edit subject"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(sub.id, sub.name)}
                    className="p-1.5 ch-text-muted hover:text-rose-500 rounded transition-colors cursor-pointer"
                    title="Delete subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t ch-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold ch-btn-secondary rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
