import { dueDisplay } from '../utils/taskHelpers';

export default function TaskTable({ filteredTasks, subjects, filters, onFilterChange, onStatusChange }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Task list</h2>
        <div className="filters">
          <input
            className="input compact-input"
            placeholder="Search"
            value={filters.query}
            onChange={(event) => onFilterChange((current) => ({ ...current, query: event.target.value }))}
          />
          <select
            className="input compact-input"
            value={filters.subject}
            onChange={(event) => onFilterChange((current) => ({ ...current, subject: event.target.value }))}
          >
            <option value="">All courses</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <select
            className="input compact-input"
            value={filters.status}
            onChange={(event) => onFilterChange((current) => ({ ...current, status: event.target.value }))}
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
                    <select
                      className="input compact-input"
                      value={task.status}
                      onChange={(event) => onStatusChange(task.id, event.target.value)}
                    >
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
  );
}
