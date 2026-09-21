export default function Section({ id, title, children }) {
  const titleId = `${id}-title`
  return (
    <section id={id} aria-labelledby={titleId} className="app-section">
      <h2 id={titleId} className="section-title">{title}</h2>
      {children}
    </section>
  )
}