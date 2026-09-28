import { InboxIcon } from './Icons.jsx'

export default function EmptyState({ title, children }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        <InboxIcon size={38} className="empty-state-svg" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {children && <div className="empty-state-content">{children}</div>}
    </div>
  )
}