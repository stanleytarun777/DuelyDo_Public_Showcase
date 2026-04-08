export default function CreateFolderForm({ folderForm, folderCourseOptions, onChange, onSubmit, onSeedFolders }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Create course folder</h2>
        <button className="ghost-btn" type="button" onClick={onSeedFolders}>Auto-create</button>
      </div>
      <form className="stack" onSubmit={onSubmit}>
        <input
          className="input"
          list="course-options"
          placeholder="Course name"
          value={folderForm.course}
          onChange={(event) => onChange((current) => ({ ...current, course: event.target.value }))}
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
          onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))}
        />
        <textarea
          className="input textarea"
          placeholder="Optional note"
          value={folderForm.note}
          onChange={(event) => onChange((current) => ({ ...current, note: event.target.value }))}
        />
        <button className="primary-btn" type="submit">Create folder</button>
      </form>
    </div>
  );
}
