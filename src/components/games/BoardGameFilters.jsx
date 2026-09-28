import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'
import { SearchIcon, RotateCcwIcon } from '../ui/Icons.jsx'

export default function BoardGameFilters({
  query,
  availableOnly,
  onQueryChange,
  onAvailableOnlyChange,
  onReset,
}) {
  return (
    <div className="catalog-filters">
      <div className="filters-primary-row">
        <FormField id="filter-search" label="Пошук настільної гри">
          <div className="search-input-wrapper">
            <SearchIcon size={16} className="search-icon-svg" />
            <input
              id="filter-search"
              type="text"
              placeholder="Введіть назву гри (наприклад, Дюна, Крила)..."
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
      </div>

      <div className="filters-secondary-row">
        <div className="checkbox-field custom-checkbox">
          <input
            id="filter-available"
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => onAvailableOnlyChange(e.target.checked)}
          />
          <label htmlFor="filter-available">
            <span className="checkbox-text">Лише в наявності</span>
          </label>
        </div>

        <AppButton variant="secondary" onClick={onReset}>
          <RotateCcwIcon size={15} className="reset-icon-svg" />
          <span>Скинути фільтри</span>
        </AppButton>
      </div>
    </div>
  )
}