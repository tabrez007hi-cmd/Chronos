import React, { useState, useEffect } from 'react';
import {
  Plus,
  Play,
  Trash2,
  Calendar,
  X,
  Check,
  Edit2,
  Layers,
} from 'lucide-react';
import { StudyTask, SubjectItem, TaskPriority } from '../types';
import { getSubjectStyle } from '../utils/storage';

interface TaskDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: StudyTask[];
  onUpdateTasks: (tasks: StudyTask[]) => void;
  subjects: SubjectItem[];
  activeSubject: string;
  onStartFocusWithTask: (task: StudyTask) => void;
  onAwardPoints?: (amount: number) => void;
}

export const TaskDesignerModal: React.FC<TaskDesignerModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onUpdateTasks,
  subjects,
  activeSubject,
  onStartFocusWithTask,
  onAwardPoints,
}) => {
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [mobileSection, setMobileSection] = useState<'list' | 'designer'>('list');

  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [subject, setSubject] = useState<string>(activeSubject || 'Mathematics');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState<number>(2);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  useEffect(() => {
    if (isOpen && !isEditingId) {
      setSubject(activeSubject || 'Mathematics');
    }
  }, [isOpen, activeSubject, isEditingId]);

  if (!isOpen) return null;

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditingId) {
      const updated = tasks.map((t) =>
        t.id === isEditingId
          ? {
              ...t,
              title: title.trim(),
              subject,
              estimatedPomodoros,
              priority,
              description: description.trim(),
              dueDate: dueDate || undefined,
            }
          : t
      );
      onUpdateTasks(updated);
      setIsEditingId(null);
    } else {
      const newTask: StudyTask = {
        id: `task-${Date.now()}`,
        title: title.trim(),
        subject,
        estimatedPomodoros,
        completedPomodoros: 0,
        done: false,
        priority,
        description: description.trim(),
        dueDate: dueDate || undefined,
        createdAt: Date.now(),
      };
      onUpdateTasks([newTask, ...tasks]);
    }

    setTitle('');
    setDescription('');
    setDueDate('');
    setEstimatedPomodoros(2);
    setPriority('medium');
    setMobileSection('list');
  };

  const handleStartEdit = (t: StudyTask) => {
    setIsEditingId(t.id);
    setTitle(t.title);
    setSubject(t.subject);
    setEstimatedPomodoros(t.estimatedPomodoros);
    setPriority(t.priority || 'medium');
    setDescription(t.description || '');
    setDueDate(t.dueDate || '');
    setMobileSection('designer');
  };

  const handleCancelEdit = () => {
    setIsEditingId(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setEstimatedPomodoros(2);
    setPriority('medium');
  };

  const handleToggleDone = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    const shouldAward = Boolean(task && !task.done && !task.rewardClaimed);

    const updated = tasks.map((t) => {
      if (t.id === id) {
        const nextDone = !t.done;
        return {
          ...t,
          done: nextDone,
          rewardClaimed: nextDone ? true : t.rewardClaimed,
          completedPomodoros: nextDone
            ? Math.max(t.completedPomodoros, t.estimatedPomodoros)
            : t.completedPomodoros,
        };
      }
      return t;
    });
    onUpdateTasks(updated);

    if (shouldAward && onAwardPoints) {
      onAwardPoints(10);
    }
  };

  const handleDelete = (id: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== id));
    if (isEditingId === id) handleCancelEdit();
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterSubject !== 'all' && t.subject !== filterSubject) return false;
    if (filterPriority !== 'all' && (t.priority || 'medium') !== filterPriority) return false;
    if (filterStatus === 'active' && t.done) return false;
    if (filterStatus === 'completed' && !t.done) return false;
    return true;
  });

  const totalCompleted = tasks.filter((t) => t.done).length;
  const totalPendingEstPoms = tasks
    .filter((t) => !t.done)
    .reduce((acc, t) => acc + Math.max(0, t.estimatedPomodoros - t.completedPomodoros), 0);
  const estimatedHoursLeft = (totalPendingEstPoms * 0.45).toFixed(1);

  const priorityMeta: Record<TaskPriority, { label: string; colorClass: string }> = {
    low: { label: 'Low', colorClass: 'ch-text-muted' },
    medium: { label: 'Medium', colorClass: 'text-sky-600 dark:text-sky-300' },
    high: { label: 'High Priority', colorClass: 'ch-text-accent' },
    urgent: { label: 'Urgent Exam', colorClass: 'text-rose-600 dark:text-rose-400' },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-1.5 sm:p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl ch-glass-modal rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[96dvh] sm:max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-5 border-b ch-border ch-glass-subtle shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl ch-accent-soft flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-lg font-bold ch-text truncate">
                  Study Task Designer
                </h3>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                  · +10 XP / task
                </span>
              </div>
              <p className="hidden sm:block [@media(max-height:560px)]:hidden text-xs ch-text-muted mt-0.5 truncate">
                Design focused objectives, calibrate Pomodoro block estimates, and initiate 1-click
                study sessions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors shrink-0 cursor-pointer"
            title="Close planner"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Task Metrics & Filter Bar */}
        <div className="ch-glass-subtle border-b ch-border px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-3 text-[11px] sm:text-xs tabular-nums">
            <div>
              <span className="ch-text-muted">Done: </span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {totalCompleted}/{tasks.length}
              </strong>
            </div>
            <div>
              <span className="ch-text-muted">Left: </span>
              <strong className="ch-text-accent font-mono font-bold">
                {totalPendingEstPoms} sprints ({estimatedHoursLeft}h)
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="text-[11px] sm:text-xs ch-input rounded-lg px-2 py-1 min-w-0 max-w-[125px]"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="hidden sm:block text-[11px] sm:text-xs ch-input rounded-lg px-2 py-1 min-w-0"
            >
              <option value="all">Any Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed')}
              className="text-[11px] sm:text-xs ch-input rounded-lg px-2 py-1 min-w-0"
            >
              <option value="all">All Status</option>
              <option value="active">Pending</option>
              <option value="completed">Done</option>
            </select>
          </div>
        </div>

        {/* Mobile/Tablet View Switcher */}
        <div className="lg:hidden flex border-b ch-border px-3 ch-glass-subtle shrink-0">
          <button
            type="button"
            onClick={() => setMobileSection('list')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              mobileSection === 'list' ? 'ch-text-accent' : 'border-transparent ch-text-muted'
            }`}
            style={mobileSection === 'list' ? { borderColor: 'var(--ch-accent)' } : undefined}
          >
            Task Queue ({filteredTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileSection('designer')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              mobileSection === 'designer' ? 'ch-text-accent' : 'border-transparent ch-text-muted'
            }`}
            style={mobileSection === 'designer' ? { borderColor: 'var(--ch-accent)' } : undefined}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isEditingId ? 'Edit Task' : 'New Task'}</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Form Column */}
          <form
            onSubmit={handleSaveTask}
            className={`${
              mobileSection === 'designer' ? 'block' : 'hidden lg:block'
            } lg:col-span-5 lg:overflow-y-auto min-h-0 p-3.5 sm:p-4 rounded-2xl ch-glass-card space-y-3.5 h-fit lg:max-h-full`}
          >
            <div className="flex items-center justify-between border-b ch-border pb-2">
              <span className="text-xs font-bold uppercase tracking-wider ch-text-secondary flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 ch-text-accent" />
                {isEditingId ? 'Edit Study Task' : 'Design New Task'}
              </span>
              {isEditingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs ch-text-muted hover:ch-text cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="min-w-0">
              <label className="text-xs ch-text-muted block mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Linear Algebra Eigenvectors"
                className="w-full min-w-0 px-3 py-2 text-xs ch-input rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="min-w-0">
                <label className="text-xs ch-text-muted block mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full min-w-0 px-2.5 py-2 text-xs ch-input rounded-xl"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="text-xs ch-text-muted block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full min-w-0 px-2.5 py-2 text-xs ch-input rounded-xl"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="min-w-0">
                <label className="text-xs ch-text-muted block mb-1 tabular-nums">
                  Est. Pomodoros ({estimatedPomodoros * 25}m)
                </label>
                <div className="flex items-center gap-2 h-8">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={estimatedPomodoros}
                    onChange={(e) => setEstimatedPomodoros(parseInt(e.target.value) || 1)}
                    className="w-full min-w-0 h-1.5 rounded-lg cursor-pointer"
                    style={{ accentColor: 'var(--ch-accent)' }}
                  />
                  <span className="font-mono text-xs font-bold ch-text-accent w-5 text-right shrink-0 tabular-nums">
                    {estimatedPomodoros}
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <label className="text-xs ch-text-muted block mb-1">Target Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full min-w-0 px-2.5 py-1.5 text-xs ch-input rounded-xl"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label className="text-xs ch-text-muted block mb-1">Notes / Checklist Criteria</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key formulas, exercise numbers, textbook chapters..."
                className="w-full min-w-0 px-3 py-2 text-xs ch-input rounded-xl resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 ch-btn-primary text-xs rounded-xl cursor-pointer"
            >
              {isEditingId ? 'Update Study Task' : 'Save Task to Agenda'}
            </button>
          </form>

          {/* Filtered Task List */}
          <div
            className={`${
              mobileSection === 'list' ? 'flex' : 'hidden lg:flex'
            } lg:col-span-7 flex-col min-h-0 lg:overflow-hidden space-y-2.5`}
          >
            <div className="hidden lg:flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider ch-text-muted">
                Tasks Queue ({filteredTasks.length})
              </span>
            </div>

            <div className="space-y-2.5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
              {filteredTasks.map((t) => {
                const subStyle = getSubjectStyle(t.subject, subjects);
                const priorityInfo = priorityMeta[t.priority || 'medium'];

                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl ch-glass-card transition-all flex flex-col gap-2.5 ${
                      t.done ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleDone(t.id)}
                          className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            t.done
                              ? 'bg-emerald-500 border-emerald-400 text-neutral-950'
                              : 'ch-border ch-glass-subtle'
                          }`}
                        >
                          {t.done && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-xs font-bold leading-snug break-words ${
                              t.done ? 'line-through ch-text-muted' : 'ch-text'
                            }`}
                          >
                            {t.title}
                          </h4>

                          {t.description && (
                            <p className="text-[11px] ch-text-muted mt-1 line-clamp-2">
                              {t.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(t)}
                          className="p-1.5 ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 ch-text-muted hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t ch-border">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className={`font-semibold ${subStyle.text}`}>{t.subject}</span>
                        <span className="ch-text-muted">·</span>
                        <span className={`font-semibold ${priorityInfo.colorClass}`}>
                          {priorityInfo.label}
                        </span>
                        <span className="ch-text-muted">·</span>
                        <span className="ch-text-muted font-mono tabular-nums">
                          {t.completedPomodoros}/{t.estimatedPomodoros} sprints
                        </span>

                        {t.dueDate && (
                          <>
                            <span className="ch-text-muted">·</span>
                            <span className="ch-text-muted flex items-center gap-1 tabular-nums">
                              <Calendar className="w-3 h-3" />
                              {t.dueDate}
                            </span>
                          </>
                        )}
                      </div>

                      {!t.done && (
                        <button
                          type="button"
                          onClick={() => {
                            onStartFocusWithTask(t);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 ch-accent-soft hover:brightness-110 font-bold rounded-lg text-[11px] transition-all cursor-pointer"
                          title="Start Pomodoro timer with this task"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Start Focus</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredTasks.length === 0 && (
                <div className="text-center py-10 rounded-2xl ch-glass-subtle text-xs ch-text-muted">
                  No tasks matching the selected filters. Use the designer to add your first study
                  task!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 ch-glass-subtle border-t ch-border flex items-center justify-between gap-3 text-xs ch-text-muted shrink-0">
          <span className="hidden sm:inline truncate">
            Checking off tasks awards +10 Focus XP to your study account!
          </span>
          <span className="sm:hidden text-[11px] truncate">+10 XP per task completed</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 ch-btn-secondary rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
