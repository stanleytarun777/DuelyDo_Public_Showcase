import { dueDisplay } from '../Utils/TaskHelpers';

export default function FolderGrid({ folders, tasks, onRemoveFolder, onFocusFolder }) {
  return (
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
                  <button className="icon-btn" onClick={() => onRemoveFolder(folder.id)} aria-label="Delete folder">✕</button>
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
                <button className="ghost-btn" onClick={() => onFocusFolder(folder.course)}>View tasks</button>
              </article>
            );
          })
        ) : (
          <div className="empty-card">Create folders for each course so students can keep work grouped by class.</div>
        )}
      </div>
    </div>
  );
}
