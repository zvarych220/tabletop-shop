export default function MainNav({ links }) {
  return (
    <nav className="site-nav" aria-label="Основна навігація">
      <ul className="nav-list">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}