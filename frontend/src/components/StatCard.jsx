function StatCard({
  title,
  value,
  subtitle,
  icon
}) {

  return (
    <div className="stat-card">

      <div className="stat-header">

        <div className="stat-icon">
          {icon}
        </div>

        <span>{title}</span>

      </div>

      <h2>{value}</h2>

      <p>{subtitle}</p>

    </div>
  );
}

export default StatCard;