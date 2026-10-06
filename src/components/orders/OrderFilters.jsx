import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'
import { SearchIcon, RotateCcwIcon } from '../ui/Icons.jsx'

export default function OrderFilters({
  query,
  carrier,
  sort,
  onQueryChange,
  onCarrierChange,
  onSortChange,
  onReset,
}) {
  return (
    <div className="catalog-filters order-filters-box">
      <FormField id="filter-order-search" label="Пошук у замовленнях">
        <div className="search-input-wrapper">
          <SearchIcon size={16} className="search-icon-svg" />
          <input
            id="filter-order-search"
            type="text"
            placeholder="Пошук за прізвищем, телефоном, містом або грою..."
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
        <FormField id="filter-carrier" label="Служба доставки">
          <select
            id="filter-carrier"
            value={carrier}
            onChange={(e) => onCarrierChange(e.target.value)}
            className="form-select"
          >
            <option value="all">Усі перевізники</option>
            <option value="nova_poshta">Нова Пошта</option>
            <option value="ukr_poshta">Укрпошта</option>
          </select>
        </FormField>

        <FormField id="filter-sort" label="Сортування">
          <select
            id="filter-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="form-select"
          >
            <option value="latest">Спочатку новіші</option>
            <option value="price-desc">Сума: від найбільшої</option>
            <option value="price-asc">Сума: від найменшої</option>
          </select>
        </FormField>
      </div>

      <div className="filters-actions-row">
        <AppButton variant="secondary" onClick={onReset}>
          <RotateCcwIcon size={15} className="reset-icon-svg" />
          <span>Скинути умови</span>
        </AppButton>
      </div>
    </div>
  )
}
