import MainNav from '../navigation/MainNav.jsx'

export default function SiteHeader({ title, links }) {
  return (
    <header className="site-header">
      <div className="logo-box">
        <span className="logo-icon">🎲</span>
        <span className="logo-text">{title}</span>
      </div>
      <MainNav links={links} />
    </header>
  )
}