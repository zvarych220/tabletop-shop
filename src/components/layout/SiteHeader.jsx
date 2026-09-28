import { Link } from 'react-router'
import MainNav from '../navigation/MainNav.jsx'
import { DiceIcon } from '../ui/Icons.jsx'

export default function SiteHeader({ title, links }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-title logo-box" to="/">
          <span className="logo-icon-wrapper">
            <DiceIcon size={22} className="logo-icon-svg" />
          </span>
          <div className="logo-text-group">
            <span className="logo-text">{title}</span>
            <span className="logo-subtext">Tabletop Shop</span>
          </div>
        </Link>
        <MainNav links={links} />
      </div>
    </header>
  )
}