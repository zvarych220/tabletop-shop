import { Link } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import Section from '../components/ui/Section.jsx'
import CatalogSummary from '../components/games/CatalogSummary.jsx'
import BoardGameFilters from '../components/games/BoardGameFilters.jsx'
import BoardGameList from '../components/games/BoardGameList.jsx'
import useBoardGameFilters from '../hooks/useBoardGameFilters.js'
import { TargetIcon } from '../components/ui/Icons.jsx'

export default function BoardGameListPage({ items, selectedId, onSelect }) {
  const {
    query,
    setQuery,
    availableOnly,
    setAvailableOnly,
    visibleItems,
    resetFilters,
  } = useBoardGameFilters(items)

  const selectedGame = items.find((g) => g.id === selectedId)
  const requestSearch = selectedId ? `?gameId=${selectedId}` : ''

  return (
    <div className="catalog-page">
      <div className="catalog-hero-header">
        <PageHeading title="Каталог настільних ігор" />
        <p className="catalog-subtitle">
          Обирайте хіти для затишних сімейних вечорів, галасливих вечірок або хардкорних стратегічних дуелей.
        </p>
      </div>

      <Section id="catalog-section" title="Пошук та вибір">
        <div className="catalog-toolbar">
          <CatalogSummary total={items.length} />
          <p className="items-count-badge">
            Знайдено: <strong>{visibleItems.length}</strong> з {items.length}
          </p>
        </div>

        <BoardGameFilters
          query={query}
          availableOnly={availableOnly}
          onQueryChange={setQuery}
          onAvailableOnlyChange={setAvailableOnly}
          onReset={resetFilters}
        />

        <BoardGameList
          items={visibleItems}
          selectedId={selectedId}
          onSelect={onSelect}
          emptyTitle={items.length === 0 ? 'Каталог порожній' : 'За цими фільтрами нічого не знайдено'}
        />

        {selectedId && (
          <div className="floating-order-cta" role="region" aria-label="Панель швидкого замовлення">
            <div className="cta-info">
              <span className="cta-icon-wrapper">
                <TargetIcon size={24} className="cta-icon-svg" />
              </span>
              <div className="cta-text-group">
                <span className="cta-title">
                  Обрано: <strong>{selectedGame?.title ?? selectedId}</strong>
                </span>
                <span className="cta-sub">
                  Перейдіть до формування заявки на бронювання або доставку
                </span>
              </div>
            </div>
            <Link to={`/orders/new${requestSearch}`} className="app-button app-button-primary cta-btn">
              <span>Оформити замовлення</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </Section>
    </div>
  )
}