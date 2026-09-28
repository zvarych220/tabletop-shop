import { Link, useNavigate, useParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import AvailabilityBadge from '../components/games/AvailabilityBadge.jsx'
import useBoardGameSelection from '../hooks/useBoardGameSelection.js'
import NotFoundPage from './NotFoundPage.jsx'
import {
  SwordsIcon,
  PartyIcon,
  CompassIcon,
  FeatherIcon,
  DiceIcon,
  UsersIcon,
  ClockIcon,
  CoinsIcon,
  ShieldCheckIcon,
  PackageIcon,
  MessageSquareIcon,
} from '../components/ui/Icons.jsx'

function renderCategoryIcon(category) {
  switch (category) {
    case 'Стратегія':
      return <SwordsIcon size={36} className="details-svg-icon" />
    case 'Паті-гра':
      return <PartyIcon size={36} className="details-svg-icon" />
    case 'Кооперативна':
      return <CompassIcon size={36} className="details-svg-icon" />
    case 'Сімейна':
      return <FeatherIcon size={36} className="details-svg-icon" />
    default:
      return <DiceIcon size={36} className="details-svg-icon" />
  }
}

export default function BoardGameDetailsPage({ items }) {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { selectGame } = useBoardGameSelection()

  const game = items.find((entry) => entry.id === gameId)

  if (!game) {
    return (
      <NotFoundPage
        title="Гру не знайдено"
        message={`Гру з ідентифікатором «${gameId}» не знайдено в каталозі магазину.`}
      />
    )
  }

  function handleOrder() {
    selectGame(game.id)
    navigate(`/orders/new?gameId=${game.id}`)
  }

  return (
    <div className="game-details-page">
      <nav aria-label="Хлібні крихти" className="breadcrumbs-nav">
        <Link to="/" className="breadcrumb-link">Головна</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/games" className="breadcrumb-link">Каталог</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current" aria-current="page">{game.title}</span>
      </nav>

      <div className="details-card">
        <div className="details-card-hero">
          <div className={`details-art-badge card-art-${game.id}`}>
            <div className="details-art-icon" aria-hidden="true">
              {renderCategoryIcon(game.category)}
            </div>
          </div>
          <div className="details-heading-group">
            <div className="details-header">
              <span className="game-category">{game.category}</span>
              <AvailabilityBadge available={game.inStock} />
            </div>
            <PageHeading title={game.title} />
          </div>
        </div>

        <div className="details-content-body">
          <div className="details-desc-box">
            <h3 className="section-subheading">Про гру</h3>
            <p className="details-description">{game.description}</p>
          </div>

          <div className="details-grid-specs">
            <div className="spec-card">
              <span className="spec-card-icon-wrap">
                <UsersIcon size={22} className="spec-card-svg" />
              </span>
              <div className="spec-card-text">
                <span className="spec-card-label">Кількість гравців</span>
                <strong className="spec-card-value">{game.players}</strong>
              </div>
            </div>
            <div className="spec-card">
              <span className="spec-card-icon-wrap">
                <ClockIcon size={22} className="spec-card-svg" />
              </span>
              <div className="spec-card-text">
                <span className="spec-card-label">Час партії</span>
                <strong className="spec-card-value">{game.playTime}</strong>
              </div>
            </div>
            <div className="spec-card spec-card-price">
              <span className="spec-card-icon-wrap">
                <CoinsIcon size={22} className="spec-card-svg" />
              </span>
              <div className="spec-card-text">
                <span className="spec-card-label">Вартість</span>
                <strong className="spec-card-value price-highlight">{game.price} ₴</strong>
              </div>
            </div>
          </div>

          <div className="details-perks">
            <div className="perk-item">
              <ShieldCheckIcon size={20} className="perk-svg" />
              <span>100% оригінальне ліцензійне видання</span>
            </div>
            <div className="perk-item">
              <PackageIcon size={20} className="perk-svg" />
              <span>Надійно пакуємо у фірмову плівку та картон</span>
            </div>
            <div className="perk-item">
              <MessageSquareIcon size={20} className="perk-svg" />
              <span>Можливість консультації щодо правил та аксесуарів</span>
            </div>
          </div>

          <div className="details-actions">
            <AppButton onClick={handleOrder} variant="primary">
              <span>Обрати та перейти до замовлення</span>
              <span aria-hidden="true">→</span>
            </AppButton>
            <Link to="/games" className="app-button app-button-secondary">
              ← Повернутися до каталогу
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}