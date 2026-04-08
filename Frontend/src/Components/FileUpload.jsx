export default function FileUpload({ files, loading, onFileChange, onExtract }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Upload course files</h2>
      </div>
      <input className="input" type="file" multiple onChange={onFileChange} />
      <button className="primary-btn" disabled={loading} onClick={onExtract}>
        {loading ? 'Extracting...' : 'Extract tasks with AI'}
      </button>
      <div className="file-list">
        {files.map((file) => (
          <span key={file.name} className="chip">{file.name}</span>
        ))}
      </div>
    </div>
  );
}
