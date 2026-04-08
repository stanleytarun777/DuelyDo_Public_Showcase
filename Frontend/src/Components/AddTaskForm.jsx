export default function AddTaskForm({ manualTask, onChange, onSubmit }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Add a manual task</h2>
      </div>
      <form className="stack" onSubmit={onSubmit}>
        <input
          className="input"
          placeholder="Task title"
          value={manualTask.title}
          onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Subject"
          value={manualTask.subject}
          onChange={(event) => onChange((current) => ({ ...current, subject: event.target.value }))}
        />
        <input
          className="input"
          type="date"
          value={manualTask.dueDate}
          onChange={(event) => onChange((current) => ({ ...current, dueDate: event.target.value }))}
        />
        <div className="inline-grid">
          <select
            className="input"
            value={manualTask.priority}
            onChange={(event) => onChange((current) => ({ ...current, priority: event.target.value }))}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            className="input"
            value={manualTask.type}
            onChange={(event) => onChange((current) => ({ ...current, type: event.target.value }))}
          >
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
        <textarea
          className="input textarea"
          placeholder="Description"
          value={manualTask.description}
          onChange={(event) => onChange((current) => ({ ...current, description: event.target.value }))}
        />
        <button className="primary-btn" type="submit">Add task</button>
      </form>
    </div>
  );
}
