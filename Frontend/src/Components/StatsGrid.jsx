export default function StatsGrid({ stats }) {
  return (
    <div className="stats-grid">
      <article className="stat-card"><span>Total tasks</span><strong>{stats.total}</strong></article>
      <article className="stat-card"><span>Due this week</span><strong>{stats.dueSoon}</strong></article>
      <article className="stat-card"><span>Overdue</span><strong>{stats.overdue}</strong></article>
      <article className="stat-card"><span>Completed</span><strong>{stats.done}</strong></article>
    </div>
  );
}
