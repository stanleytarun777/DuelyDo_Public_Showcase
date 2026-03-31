import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TASKS_KEY = 'studysync.react.tasks.v1';
const FOLDERS_KEY = 'studysync.react.folders.v1';

const emptyManualTask = {
  title: '',
  subject: '',
  dueDate: '',
  priority: 'medium',
  type: 'assignment',
  description: ''
};

function normalizeTask(task, index = 0) {
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

function normalizeFolder(folder, index = 0) {
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

function isOverdue(dateString) {
  if (!dateString) return false;
  const due = new Date(dateString);
  due.setHours(23, 59, 59, 999);
  return due < new Date();
}

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
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]').map(normalizeTask);
    } catch {
      return [];
    }
  });
  const [folders, setFolders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]').map(normalizeFolder).filter(Boolean);
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

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  }, [folders]);

  const subjects = useMemo(() => {
    return [...new Set(tasks.map((task) => task.subject).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const folderCourseOptions = useMemo(() => {
    return [...new Set([...subjects, ...folders.map((folder) => folder.course)])].sort((a, b) => a.localeCompare(b));
  }, [folders, subjects]);

  const stats = useMemo(() => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    return {
      total: tasks.length,
      dueSoon: tasks.filter((task) => task.status !== 'done' && task.dueDate && new Date(task.dueDate) <= weekEnd).length,
      overdue: tasks.filter((task) => task.status === 'overdue').length,
      done: tasks.filter((task) => task.status === 'done').length
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => (filters.subject ? task.subject === filters.subject : true))
      .filter((task) => (filters.status === 'all' ? true : task.status === filters.status))
      .filter((task) => {
        const query = filters.query.trim().toLowerCase();
        if (!query) return true;
        return [task.title, task.description, task.subject].some((value) => String(value).toLowerCase().includes(query));
      })
      .sort((a, b) => {
        const aDate = a.dueDate || '9999-12-31';
        const bDate = b.dueDate || '9999-12-31';
        return aDate.localeCompare(bDate);
      });
  }, [filters, tasks]);

  function handleFileChange(event) {
    const nextFiles = Array.from(event.target.files || []);
    setFiles(nextFiles);
  }

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

  function createFolder(event) {
    event.preventDefault();
    const course = folderForm.course.trim();
    const name = folderForm.name.trim() || `${course} Folder`;

    if (!course) {
      setError('Course name is required to create a folder.');
      return;
    }

    const exists = folders.some(
      (folder) => folder.course.toLowerCase() === course.toLowerCase() && folder.name.toLowerCase() === name.toLowerCase()
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

  function seedFolders() {
    if (!subjects.length) {
      setError('Add or extract some tasks first so the app can discover your courses.');
      return;
    }

    let created = 0;
    const nextFolders = [...folders];
    subjects.forEach((course) => {
      const exists = nextFolders.some((folder) => folder.course.toLowerCase() === course.toLowerCase());
      if (!exists) {
        nextFolders.push(normalizeFolder({ course, name: `${course} Folder`, createdAt: new Date().toISOString() }));
        created += 1;
      }
    });

    setFolders(nextFolders);
    setError('');
    setMessage(created ? `Created ${created} folder(s) from your current subjects.` : 'Every detected course already has a folder.');
  }

  function removeFolder(folderId) {
    setFolders((current) => current.filter((folder) => folder.id !== folderId));
  }

  function focusFolder(course) {
    setFilters((current) => ({ ...current, subject: course }));
    setMessage(`Showing tasks for ${course}.`);
  }

  function updateTaskStatus(taskId, status) {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        return normalizeTask({ ...task, status });
      })
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">StudySync AI</p>
          <h1>Production dashboard</h1>
          <p className="muted">React frontend + Python AI backend scaffolded for deployment.</p>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Upload course files</h2>
          </div>
          <input className="input" type="file" multiple onChange={handleFileChange} />
          <button className="primary-btn" disabled={loading} onClick={handleExtract}>
            {loading ? 'Extracting...' : 'Extract tasks with AI'}
          </button>
          <div className="file-list">
            {files.map((file) => (
              <span key={file.name} className="chip">{file.name}</span>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Create course folder</h2>
            <button className="ghost-btn" type="button" onClick={seedFolders}>Auto-create</button>
          </div>
          <form className="stack" onSubmit={createFolder}>
            <input
              className="input"
              list="course-options"
              placeholder="Course name"
              value={folderForm.course}
              onChange={(event) => setFolderForm((current) => ({ ...current, course: event.target.value }))}
            />
            <datalist id="course-options">
              {folderCourseOptions.map((course) => (
                <option key={course} value={course} />
              ))}
            </datalist>
            <input
              className="input"
              placeholder="Folder name"
              value={folderForm.name}
              onChange={(event) => setFolderForm((current) => ({ ...current, name: event.target.value }))}
            />
            <textarea
              className="input textarea"
              placeholder="Optional note"
              value={folderForm.note}
              onChange={(event) => setFolderForm((current) => ({ ...current, note: event.target.value }))}
            />
            <button className="primary-btn" type="submit">Create folder</button>
          </form>
        </div>
      </aside>

      <main className="content">
        <section className="hero">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>Course folders and deadlines</h2>
            <p className="muted">{message}</p>
            {error ? <p className="error-text">{error}</p> : null}
          </div>
          <div className="stats-grid">
            <article className="stat-card"><span>Total tasks</span><strong>{stats.total}</strong></article>
            <article className="stat-card"><span>Due this week</span><strong>{stats.dueSoon}</strong></article>
            <article className="stat-card"><span>Overdue</span><strong>{stats.overdue}</strong></article>
            <article className="stat-card"><span>Completed</span><strong>{stats.done}</strong></article>
          </div>
        </section>

        <section className="section-grid">
          <div className="panel wide-panel">
            <div className="panel-header">
              <h2>Course folders</h2>
              <span className="muted-small">{folders.length} folder(s)</span>
            </div>
            <div className="folder-grid">
              {folders.length ? (
                folders.map((folder) => {
                  const folderTasks = tasks.filter((task) => task.subject === folder.course);
                  const nextTask = folderTasks
                    .filter((task) => task.status !== 'done' && task.dueDate)
                    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

                  return (
                    <article className="folder-card" key={folder.id}>
                      <div className="folder-card-top">
                        <div>
                          <p className="folder-title">{folder.name}</p>
                          <p className="folder-subtitle">{folder.course}</p>
                        </div>
                        <button className="icon-btn" onClick={() => removeFolder(folder.id)} aria-label="Delete folder">✕</button>
                      </div>
                      {folder.note ? <p className="muted-small">{folder.note}</p> : null}
                      <div className="metric-row">
                        <div><strong>{folderTasks.length}</strong><span>Tasks</span></div>
                        <div><strong>{folderTasks.filter((task) => task.status !== 'done').length}</strong><span>Open</span></div>
                        <div><strong>{folderTasks.filter((task) => task.status === 'done').length}</strong><span>Done</span></div>
                      </div>
                      <p className="muted-small">
                        {nextTask ? `Next: ${nextTask.title} · ${dueDisplay(nextTask.dueDate)}` : 'No upcoming deadlines yet'}
                      </p>
                      <button className="ghost-btn" onClick={() => focusFolder(folder.course)}>View tasks</button>
                    </article>
                  );
                })
              ) : (
                <div className="empty-card">Create folders for each course so students can keep work grouped by class.</div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Add a manual task</h2>
            </div>
            <form className="stack" onSubmit={addManualTask}>
              <input className="input" placeholder="Task title" value={manualTask.title} onChange={(event) => setManualTask((current) => ({ ...current, title: event.target.value }))} />
              <input className="input" placeholder="Subject" value={manualTask.subject} onChange={(event) => setManualTask((current) => ({ ...current, subject: event.target.value }))} />
              <input className="input" type="date" value={manualTask.dueDate} onChange={(event) => setManualTask((current) => ({ ...current, dueDate: event.target.value }))} />
              <div className="inline-grid">
                <select className="input" value={manualTask.priority} onChange={(event) => setManualTask((current) => ({ ...current, priority: event.target.value }))}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select className="input" value={manualTask.type} onChange={(event) => setManualTask((current) => ({ ...current, type: event.target.value }))}>
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                  <option value="quiz">Quiz</option>
                  <option value="project">Project</option>
                  <option value="reading">Reading</option>
                  <option value="lab">Lab</option>
                  <option value="essay">Essay</option>
                  <option value="presentation">Presentation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <textarea className="input textarea" placeholder="Description" value={manualTask.description} onChange={(event) => setManualTask((current) => ({ ...current, description: event.target.value }))} />
              <button className="primary-btn" type="submit">Add task</button>
            </form>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Task list</h2>
            <div className="filters">
              <input
                className="input compact-input"
                placeholder="Search"
                value={filters.query}
                onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
              />
              <select
                className="input compact-input"
                value={filters.subject}
                onChange={(event) => setFilters((current) => ({ ...current, subject: event.target.value }))}
              >
                <option value="">All courses</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <select
                className="input compact-input"
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="all">All statuses</option>
                <option value="todo">To do</option>
                <option value="inprogress">In progress</option>
                <option value="done">Done</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Course</th>
                  <th>Due</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length ? (
                  filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td data-label="Task">
                        <strong>{task.title}</strong>
                        <p className="table-subtext">{task.description || task.type}</p>
                      </td>
                      <td data-label="Course">{task.subject}</td>
                      <td data-label="Due">{dueDisplay(task.dueDate)}</td>
                      <td data-label="Priority"><span className={`badge ${task.priority}`}>{task.priority}</span></td>
                      <td data-label="Status">
                        <select className="input compact-input" value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value)}>
                          <option value="todo">To do</option>
                          <option value="inprogress">In progress</option>
                          <option value="done">Done</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-cell">No tasks match the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
