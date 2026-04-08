// React hooks for lifecycle, memoization, and state management
import { useEffect, useMemo, useState } from 'react';

// Base API URL (points to your Python backend or fallback local API route)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// LocalStorage keys for persistence (browser-side storage)
const TASKS_KEY = 'studysync.react.tasks.v1';
const FOLDERS_KEY = 'studysync.react.folders.v1';

// Default structure for manually added tasks
const emptyManualTask = {
  title: '',
  subject: '',
  dueDate: '',
  priority: 'medium',
  type: 'assignment',
  description: ''
};

/**
 * Normalize task object to enforce consistent structure
 * Handles missing fields, assigns defaults, and determines status
 */
function normalizeTask(task, index = 0) {
  const status =
    task.status === 'done'
      ? 'done'
      : task.status === 'inprogress'
      ? 'inprogress'
      : 'todo';

  return {
    id: task.id || `task-${Date.now()}-${index}`, // Unique fallback ID
    title: task.title || 'Untitled task',
    subject: task.subject || 'General',
    dueDate: task.dueDate || '',
    priority: task.priority || 'medium',
    type: task.type || 'other',
    description: task.description || '',
    estimatedHours: task.estimatedHours ?? 1,
    points: task.points ?? null,

    // If not done → check if overdue
    status:
      status === 'done'
        ? 'done'
        : isOverdue(task.dueDate)
        ? 'overdue'
        : status
  };
}

/**
 * Normalize folder structure
 * Ensures every course has a valid folder representation
 */
function normalizeFolder(folder, index = 0) {
  const course = String(folder.course || '').trim();
  if (!course) return null; // Invalid folder

  return {
    id: folder.id || `folder-${Date.now()}-${index}`,
    course,
    name: folder.name?.trim() || `${course} Folder`,
    note: folder.note?.trim() || '',
    createdAt: folder.createdAt || new Date().toISOString()
  };
}

/**
 * Determines if a task is overdue
 * Uses end-of-day cutoff (11:59 PM)
 */
function isOverdue(dateString) {
  if (!dateString) return false;

  const due = new Date(dateString);
  due.setHours(23, 59, 59, 999);

  return due < new Date();
}

/**
 * Converts date into user-friendly labels
 * Example: "Due today", "2d overdue", etc.
 */
function dueDisplay(dateString) {
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

function App() {
  /**
   * STATE MANAGEMENT
   */

  // Tasks state (loaded from localStorage on init)
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]').map(normalizeTask);
    } catch {
      return [];
    }
  });

  // Folder state (course grouping)
  const [folders, setFolders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]')
        .map(normalizeFolder)
        .filter(Boolean);
    } catch {
      return [];
    }
  });

  const [files, setFiles] = useState([]); // Uploaded files
  const [manualTask, setManualTask] = useState(emptyManualTask);
  const [folderForm, setFolderForm] = useState({ course: '', name: '', note: '' });

  // Filtering UI state
  const [filters, setFilters] = useState({
    subject: '',
    query: '',
    status: 'all'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    'Upload your course files or add tasks manually to start organizing.'
  );
  const [error, setError] = useState('');

  /**
   * PERSISTENCE (LOCAL STORAGE SYNC)
   */

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  }, [folders]);

  /**
   * DERIVED DATA (OPTIMIZED WITH useMemo)
   */

  // Unique subjects extracted from tasks
  const subjects = useMemo(() => {
    return [...new Set(tasks.map((task) => task.subject).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [tasks]);

  // Dropdown options (merge subjects + folders)
  const folderCourseOptions = useMemo(() => {
    return [...new Set([...subjects, ...folders.map((folder) => folder.course)])].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [folders, subjects]);

  // Dashboard statistics
  const stats = useMemo(() => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);

    return {
      total: tasks.length,
      dueSoon: tasks.filter(
        (task) =>
          task.status !== 'done' &&
          task.dueDate &&
          new Date(task.dueDate) <= weekEnd
      ).length,
      overdue: tasks.filter((task) => task.status === 'overdue').length,
      done: tasks.filter((task) => task.status === 'done').length
    };
  }, [tasks]);

  /**
   * FILTERING + SEARCH + SORTING PIPELINE
   */
  const filteredTasks = useMemo(() => {
    return tasks
      // Filter by subject
      .filter((task) =>
        filters.subject ? task.subject === filters.subject : true
      )
      // Filter by status
      .filter((task) =>
        filters.status === 'all' ? true : task.status === filters.status
      )
      // Search query filter
      .filter((task) => {
        const query = filters.query.trim().toLowerCase();
        if (!query) return true;

        return [task.title, task.description, task.subject].some((value) =>
          String(value).toLowerCase().includes(query)
        );
      })
      // Sort by due date
      .sort((a, b) => {
        const aDate = a.dueDate || '9999-12-31';
        const bDate = b.dueDate || '9999-12-31';
        return aDate.localeCompare(bDate);
      });
  }, [filters, tasks]);

  /**
   * FILE HANDLING
   */

  function handleFileChange(event) {
    const nextFiles = Array.from(event.target.files || []);
    setFiles(nextFiles);
  }

  /**
   * AI EXTRACTION (calls Python backend)
   */
  async function handleExtract() {
    if (!files.length) {
      setError('Select one or more files first.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('Analyzing files with your backend AI service...');

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await fetch(`${API_BASE_URL}/extract`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || 'Task extraction failed.');
      }

      const payload = await response.json();

      // Normalize extracted tasks from AI (Python backend)
      const nextTasks = (payload.tasks || []).map(normalizeTask);

      setTasks(nextTasks);

      setMessage(`Extracted ${nextTasks.length} tasks from ${files.length} file(s).`);
      setFiles([]);
    } catch (extractError) {
      setError(extractError.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * MANUAL TASK CREATION
   */
  function addManualTask(event) {
    event.preventDefault();

    if (!manualTask.title.trim()) {
      setError('Task title is required.');
      return;
    }

    const nextTask = normalizeTask({
      ...manualTask,
      id: `manual-${Date.now()}`
    });

    setTasks((current) => [nextTask, ...current]);
    setManualTask(emptyManualTask);

    setError('');
    setMessage(`Added ${nextTask.title}.`);
  }

  /**
   * FOLDER MANAGEMENT
   */

  function createFolder(event) {
    event.preventDefault();

    const course = folderForm.course.trim();
    const name = folderForm.name.trim() || `${course} Folder`;

    if (!course) {
      setError('Course name is required to create a folder.');
      return;
    }

    // Prevent duplicates
    const exists = folders.some(
      (folder) =>
        folder.course.toLowerCase() === course.toLowerCase() &&
        folder.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      setError('That course folder already exists.');
      return;
    }

    const nextFolder = normalizeFolder({
      id: `folder-${Date.now()}`,
      course,
      name,
      note: folderForm.note,
      createdAt: new Date().toISOString()
    });

    setFolders((current) => [nextFolder, ...current]);

    setFolderForm({ course: '', name: '', note: '' });

    setError('');
    setMessage(`Created ${nextFolder.name}.`);
  }

  /**
   * AUTO-GENERATE FOLDERS FROM DETECTED SUBJECTS
   */
  function seedFolders() {
    if (!subjects.length) {
      setError('Add or extract some tasks first so the app can discover your courses.');
      return;
    }

    let created = 0;
    const nextFolders = [...folders];

    subjects.forEach((course) => {
      const exists = nextFolders.some(
        (folder) => folder.course.toLowerCase() === course.toLowerCase()
      );

      if (!exists) {
        nextFolders.push(
          normalizeFolder({
            course,
            name: `${course} Folder`,
            createdAt: new Date().toISOString()
          })
        );
        created += 1;
      }
    });

    setFolders(nextFolders);

    setError('');
    setMessage(
      created
        ? `Created ${created} folder(s) from your current subjects.`
        : 'Every detected course already has a folder.'
    );
  }

  /**
   * TASK STATUS UPDATE
   */
  function updateTaskStatus(taskId, status) {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;

        return normalizeTask({ ...task, status });
      })
    );
  }

}

export default App;
