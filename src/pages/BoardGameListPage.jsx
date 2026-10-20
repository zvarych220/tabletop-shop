import { useState } from 'react'
import PageHeading from '../components/ui/PageHeading.jsx'
import BoardGameList from '../components/games/BoardGameList.jsx'
import useBoardGameFilters from '../hooks/useBoardGameFilters.js'

export default function BoardGameListPage({ selectedId, onSelect }) {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  const {
    query,
    setQuery,
    category,
    setCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    minRating,
    setMinRating,
    availableOnly,
    setAvailableOnly,
    sortBy,
    setSortBy,
    page,
    setPage,
    visibleItems,
    pagination,
    isLoading,
    categories,
    resetFilters,
  } = useBoardGameFilters()

  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="lab-catalog-page">
      <div className="catalog-hero-header">
        <PageHeading title="Каталог настільних ігор" />
        <p className="catalog-subtitle">
          Обирайте найкращі офіційні настілки з доставкою по всій Україні через Нову Пошту та Укрпошту.
        </p>
      </div>

      {/* Catalog Top Toolbar */}
      <div className="lab-catalog-toolbar">
        <div className="toolbar-controls-row">
          <button
            type="button"
            className="lab-filter-toggle-btn"
            onClick={() => setIsFilterDrawerOpen(true)}
            aria-label="Відкрити фільтри"
          >
            <span className="filter-btn-icon">☰</span>
            <span className="filter-btn-text">ФІЛЬТРИ</span>
          </button>

          <div className="toolbar-sort-wrap">
            <label htmlFor="catalog-sort-select" className="visually-hidden">
              Сортування
            </label>
            <select
              id="catalog-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="lab-sort-select"
            >
              <option value="default">За замовчуванням</option>
              <option value="rating">Рейтинг: від найвищого</option>
              <option value="rating-asc">Рейтинг: від найнижчого</option>
              <option value="price-asc">Ціна: від дешевих до дорогих</option>
              <option value="price-desc">Ціна: від дорогих до дешевих</option>
              <option value="title">За назвою (А–Я)</option>
            </select>
          </div>
        </div>

        <div className="toolbar-meta-row">
          <span className="lab-toolbar-results-count">
            {pagination.total === 0 ? (
              'Товарів не знайдено'
            ) : pagination.total <= pagination.limit ? (
              <>
                Показано <strong>{pagination.total}</strong> з {pagination.total} товарів
              </>
            ) : (
              <>
                Показано <strong>{startItem}–{endItem}</strong> з {pagination.total} товарів
              </>
            )}
          </span>
        </div>
      </div>

      {/* Slide-over Filter Drawer */}
      {isFilterDrawerOpen && (
        <div
          className="filter-drawer-overlay"
          onClick={() => setIsFilterDrawerOpen(false)}
        >
          <aside
            className="filter-drawer"
            role="dialog"
            aria-label="Панель фільтрів"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="filter-drawer-header">
              <h2 className="filter-drawer-title">ФІЛЬТРИ</h2>
              <button
                type="button"
                className="filter-close-btn"
                onClick={() => setIsFilterDrawerOpen(false)}
                aria-label="Закрити фільтри"
              >
                ✕
              </button>
            </div>

            <div className="filter-drawer-body">
              {/* Пошук */}
              <div className="filter-group">
                <label className="filter-group-title" htmlFor="filter-search-input">
                  ПОШУК ЗА НАЗВОЮ
                </label>
                <input
                  id="filter-search-input"
                  type="text"
                  placeholder="Введіть назву гри..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="filter-input-text"
                />
              </div>

              {/* Ціна */}
              <div className="filter-group">
                <span className="filter-group-title">ЦІНА (ГРН)</span>
                <div className="filter-price-range">
                  <div className="price-inputs-row">
                    <div className="price-input-box">
                      <span className="price-curr">₴</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={minPrice || ''}
                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : 0)}
                        className="price-num-input"
                      />
                    </div>
                    <span className="price-sep">—</span>
                    <div className="price-input-box">
                      <span className="price-curr">₴</span>
                      <input
                        type="number"
                        min={minPrice || 0}
                        placeholder="До 10000"
                        value={maxPrice || ''}
                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                        className="price-num-input"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    step={100}
                    value={maxPrice || 10000}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="filter-range-slider"
                  />
                </div>
              </div>

              {/* Рейтинг */}
              <div className="filter-group">
                <span className="filter-group-title">РЕЙТИНГ</span>
                <div className="filter-rating-options">
                  {[5, 4, 3].map((r) => (
                    <label key={r} className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={minRating === r}
                        onChange={() => setMinRating(minRating === r ? 0 : r)}
                      />
                      <span className="rating-stars-visual">
                        {'★'.repeat(r)}{'☆'.repeat(5 - r)}
                      </span>
                      <span className="rating-label-text">
                        {r === 5 ? 'Лише 5 зірок' : `від ${r} зірок`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Категорія */}
              <div className="filter-group">
                <span className="filter-group-title">КАТЕГОРІЯ</span>
                <div className="filter-category-options">
                  {categories.map((cat) => (
                    <label key={cat} className="filter-radio-label">
                      <input
                        type="radio"
                        name="category"
                        checked={category === cat}
                        onChange={() => setCategory(cat)}
                      />
                      <span>{cat === 'all' ? 'Усі категорії' : cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Наявність */}
              <div className="filter-group">
                <label className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                  />
                  <span>Тільки в наявності</span>
                </label>
              </div>
            </div>

            <div className="filter-drawer-footer">
              <button
                type="button"
                className="filter-reset-btn"
                onClick={resetFilters}
              >
                Скинути фільтри
              </button>
              <button
                type="button"
                className="filter-apply-btn"
                onClick={() => setIsFilterDrawerOpen(false)}
              >
                Застосувати ({pagination.total})
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Products Grid */}
      <div className={isLoading ? 'catalog-loading-fade' : ''}>
        <BoardGameList
          items={visibleItems}
          selectedId={selectedId}
          onSelect={onSelect}
          emptyTitle="За цими умовами нічого не знайдено"
        />
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <nav className="catalog-pagination" aria-label="Навігація по каталогу">
          <button
            type="button"
            className="pagination-nav-btn"
            onClick={() => setPage(pagination.page - 1)}
            disabled={!pagination.hasPrevPage || isLoading}
            aria-label="Попередня сторінка"
          >
            ← Назад
          </button>

          <div className="pagination-pages-list">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`pagination-page-btn ${pageNum === pagination.page ? 'active' : ''}`}
                onClick={() => setPage(pageNum)}
                disabled={isLoading}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="pagination-nav-btn"
            onClick={() => setPage(pagination.page + 1)}
            disabled={!pagination.hasNextPage || isLoading}
            aria-label="Наступна сторінка"
          >
            Вперед →
          </button>
        </nav>
      )}
    </div>
  )
}