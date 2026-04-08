export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const TASKS_KEY = 'studysync.react.tasks.v1';
export const FOLDERS_KEY = 'studysync.react.folders.v1';

export const emptyManualTask = {
  title: '',
  subject: '',
  dueDate: '',
  priority: 'medium',
  type: 'assignment',
  description: ''
};

export function isOverdue(dateString) {
  if (!dateString) return false;
  const due = new Date(dateString);
  due.setHours(23, 59, 59, 999);
  return due < new Date();
}

export function dueDisplay(dateString) {
  if (!dateString) return 'No due date';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dateString);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - now) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff <= 7) return `Due in ${diff}d`;
  return due.toLocaleDateString();
}

export function normalizeTask(task, index = 0) {
  const status = task.status === 'done' ? 'done' : task.status === 'inprogress' ? 'inprogress' : 'todo';
  return {
    id: task.id || `task-${Date.now()}-${index}`,
    title: task.title || 'Untitled task',
    subject: task.subject || 'General',
    dueDate: task.dueDate || '',
    priority: task.priority || 'medium',
    type: task.type || 'other',
    description: task.description || '',
    estimatedHours: task.estimatedHours ?? 1,
    points: task.points ?? null,
    status: status === 'done' ? 'done' : isOverdue(task.dueDate) ? 'overdue' : status
  };
}

export function normalizeFolder(folder, index = 0) {
  const course = String(folder.course || '').trim();
  if (!course) return null;
  return {
    id: folder.id || `folder-${Date.now()}-${index}`,
    course,
    name: folder.name?.trim() || `${course} Folder`,
    note: folder.note?.trim() || '',
    createdAt: folder.createdAt || new Date().toISOString()
  };
}
