import { Link } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import { DiceIcon } from '../components/ui/Icons.jsx'

export default function NotFoundPage({
  title = '404: Сторінку не знайдено',
  message = 'Перевірте правильність введеної адреси або скористайтеся навігацією.',
}) {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon-wrap" aria-hidden="true">
          <DiceIcon size={44} className="not-found-dice-svg" />
          <span className="not-found-code">404</span>
        </div>
        <PageHeading title={title} />
        <p className="not-found-message">{message}</p>
        <div className="action-links">
          <Link to="/games" className="app-button app-button-primary">
            <span>Перейти до каталогу</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link to="/" className="app-button app-button-secondary">
            На головну
          </Link>
        </div>
      </div>
    </div>
  )
}