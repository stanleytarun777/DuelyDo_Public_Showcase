/**
 * App.jsx — Root component
 *
 * Owns all application state and wires it to the component tree:
 *
 *   <App>
 *     <aside>
 *       <FileUpload />
 *       <CreateFolderForm />
 *     </aside>
 *     <main>
 *       <StatsGrid />
 *       <FolderGrid />
 *       <AddTaskForm />
 *       <TaskTable />
 *     </main>
 *   </App>
 *
 * State: tasks, folders, files, filters, manualTask, folderForm, loading, error
 *
 * Derived (useMemo): subjects, folderCourseOptions, stats, filteredTasks
 *
 * Responsibilities:
 *  - LocalStorage persistence — tasks and folders sync on every state change
 *  - AI extraction flow — POST /api/extract → normalize → setTasks
 *  - Folder management — create, auto-seed from subjects, remove, focus
 *  - Task management — add manually, update status
 *  - Filter pipeline — subject → status → search query → due-date sort
 *
 * Full implementation maintained in the private repository.
 */
