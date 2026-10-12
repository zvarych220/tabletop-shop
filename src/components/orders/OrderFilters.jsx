import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'
import { SearchIcon, RotateCcwIcon } from '../ui/Icons.jsx'

export default function OrderFilters({
  query,
  consultation,
  sort,
  onQueryChange,
  onConsultationChange,
  onSortChange,
  onReset,
}) {
  return (
    <div className="catalog-filters order-filters-box">
      <FormField id="filter-order-search" label="Пошук у заявках">
        <div className="search-input-wrapper">
          <SearchIcon size={16} className="search-icon-svg" />
          <input
            id="filter-order-search"
            type="text"
            placeholder="Пошук за грою чи коментарем..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="form-input search-input"
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onQueryChange('')}
              title="Очистити пошук"
              aria-label="Очистити поле пошуку"
            >
              ✕
            </button>
          )}
        </div>
      </FormField>

      <div className="filters-inline-grid">
        <FormField id="filter-consultation" label="Консультація">
          <select
            id="filter-consultation"
            value={consultation}
            onChange={(e) => onConsultationChange(e.target.value)}
            className="form-select"
          >
            <option value="all">Усі заявки</option>
            <option value="yes">З консультацією</option>
            <option value="no">Без консультації</option>
          </select>
        </FormField>

        <FormField id="filter-sort" label="Сортування">
          <select
            id="filter-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="form-select"
          >
            <option value="name">За назвою гри</option>
            <option value="duration-asc">Тривалість: за зростанням</option>
            <option value="duration-desc">Тривалість: за спаданням</option>
          </select>
        </FormField>
      </div>

      <div className="filters-actions-row">
        <AppButton variant="secondary" onClick={onReset}>
          <RotateCcwIcon size={15} className="reset-icon-svg" />
          <span>Скинути фільтри</span>
        </AppButton>
      </div>
    </div>
  )
}
