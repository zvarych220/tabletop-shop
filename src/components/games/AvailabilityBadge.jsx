export default function AvailabilityBadge({ available }) {
  const label = available ? 'В наявності' : 'Очікується поставка'
  const className = available ? 'status-badge status-available' : 'status-badge status-out'
  return <span className={className}>{label}</span>
}