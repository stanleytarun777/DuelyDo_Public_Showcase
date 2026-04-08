import { useEffect, useMemo, useState } from 'react';

import {
  API_BASE_URL,
  TASKS_KEY,
  FOLDERS_KEY,
  emptyManualTask,
  normalizeTask,
  normalizeFolder
} from './Utils/TaskHelpers';
import AddTaskForm from './Components/AddTaskForm';
import CreateFolderForm from './Components/CreateFolderForm';
import FileUpload from './Components/FileUpload';
import FolderGrid from './Components/FolderGrid';
import StatsGrid from './Components/StatsGrid';
import TaskTable from './Components/TaskTable';

function App() {
  // ─── State ────────────────────────────────────────────────────────────────

  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]').map(normalizeTask);
    } catch {
      return [];
    }
  });

  const [folders, setFolders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]')
        .map(normalizeFolder)
        .filter(Boolean);
    } catch {
      return [];
    }
  });

  const [files, setFiles] = useState([]);
  const [manualTask, setManualTask] = useState(emptyManualTask);
  const [folderForm, setFolderForm] = useState({ course: '', name: '', note: '' });
  const [filters, setFilters] = useState({ subject: '', query: '', status: 'all' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Upload your course files or add tasks manually to start organizing.');
  const [error, setError] = useState('');

  // ─── Persistence ──────────────────────────────────────────────────────────

  useEffect(() => { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders)); }, [folders]);

  // ─── Derived data ─────────────────────────────────────────────────────────

  const subjects = useMemo(() => {
    return [...new Set(tasks.map((t) => t.subject).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const folderCourseOptions = useMemo(() => {
    return [...new Set([...subjects, ...folders.map((f) => f.course)])].sort((a, b) => a.localeCompare(b));
  }, [folders, subjects]);

  const stats = useMemo(() => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    return {
      total: tasks.length,
      dueSoon: tasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) <= weekEnd).length,
      overdue: tasks.filter((t) => t.status === 'overdue').length,
      done: tasks.filter((t) => t.status === 'done').length
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => (filters.subject ? t.subject === filters.subject : true))
      .filter((t) => (filters.status === 'all' ? true : t.status === filters.status))
      .filter((t) => {
        const q = filters.query.trim().toLowerCase();
        if (!q) return true;
        return [t.title, t.description, t.subject].some((v) => String(v).toLowerCase().includes(q));
      })
      .sort((a, b) => (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31'));
  }, [filters, tasks]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleFileChange(event) {
    setFiles(Array.from(event.target.files || []));
  }

  async function handleExtract() {
    if (!files.length) { setError('Select one or more files first.'); return; }

    setLoading(true);
    setError('');
    setMessage('Analyzing files with AI...');

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await fetch(`${API_BASE_URL}/extract`, { method: 'POST', body: formData });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || 'Task extraction failed.');
      }

      const payload = await response.json();
      const nextTasks = (payload.tasks || []).map(normalizeTask);
      setTasks(nextTasks);
      setMessage(`Extracted ${nextTasks.length} tasks from ${files.length} file(s).`);
      setFiles([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function addManualTask(event) {
    event.preventDefault();
    if (!manualTask.title.trim()) { setError('Task title is required.'); return; }
    const nextTask = normalizeTask({ ...manualTask, id: `manual-${Date.now()}` });
    setTasks((prev) => [nextTask, ...prev]);
    setManualTask(emptyManualTask);
    setError('');
    setMessage(`Added ${nextTask.title}.`);
  }

  function createFolder(event) {
    event.preventDefault();
    const course = folderForm.course.trim();
    const name = folderForm.name.trim() || `${course} Folder`;

    if (!course) { setError('Course name is required.'); return; }

    const exists = folders.some(
      (f) => f.course.toLowerCase() === course.toLowerCase() && f.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) { setError('That course folder already exists.'); return; }

    const nextFolder = normalizeFolder({ id: `folder-${Date.now()}`, course, name, note: folderForm.note, createdAt: new Date().toISOString() });
    setFolders((prev) => [nextFolder, ...prev]);
    setFolderForm({ course: '', name: '', note: '' });
    setError('');
    setMessage(`Created ${nextFolder.name}.`);
  }

  function seedFolders() {
    if (!subjects.length) { setError('Add or extract tasks first.'); return; }
    let created = 0;
    const next = [...folders];
    subjects.forEach((course) => {
      if (!next.some((f) => f.course.toLowerCase() === course.toLowerCase())) {
        next.push(normalizeFolder({ course, name: `${course} Folder`, createdAt: new Date().toISOString() }));
        created++;
      }
    });
    setFolders(next);
    setError('');
    setMessage(created ? `Created ${created} folder(s).` : 'Every course already has a folder.');
  }

  function removeFolder(folderId) {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
  }

  function focusFolder(course) {
    setFilters((prev) => ({ ...prev, subject: course }));
    setMessage(`Showing tasks for ${course}.`);
  }

  function updateTaskStatus(taskId, status) {
    setTasks((prev) => prev.map((t) => (t.id !== taskId ? t : normalizeTask({ ...t, status }))));
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">DuelyDo</p>
          <h1>Dashboard</h1>
          <p className="muted">React frontend + Python AI backend.</p>
        </div>
        <FileUpload files={files} loading={loading} onFileChange={handleFileChange} onExtract={handleExtract} />
        <CreateFolderForm
          folderForm={folderForm}
          folderCourseOptions={folderCourseOptions}
          onChange={setFolderForm}
          onSubmit={createFolder}
          onSeedFolders={seedFolders}
        />
      </aside>

      <main className="content">
        <section className="hero">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>Course folders and deadlines</h2>
            <p className="muted">{message}</p>
            {error ? <p className="error-text">{error}</p> : null}
          </div>
          <StatsGrid stats={stats} />
        </section>

        <section className="section-grid">
          <FolderGrid folders={folders} tasks={tasks} onRemoveFolder={removeFolder} onFocusFolder={focusFolder} />
          <AddTaskForm manualTask={manualTask} onChange={setManualTask} onSubmit={addManualTask} />
        </section>

        <TaskTable
          filteredTasks={filteredTasks}
          subjects={subjects}
          filters={filters}
          onFilterChange={setFilters}
          onStatusChange={updateTaskStatus}
        />
      </main>
    </div>
  );
}

export default App;
