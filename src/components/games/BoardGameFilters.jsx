import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'

export default function BoardGameFilters({
  query,
  availableOnly,
  onQueryChange,
  onAvailableOnlyChange,
  onReset,
}) {
  return (
    <div className="catalog-filters">
      <FormField id="filter-search" label="Пошук настільної гри">
        <input
          id="filter-search"
          type="text"
          placeholder="Введіть назву гри (наприклад, Дюна)..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="form-input"
        />
      </FormField>

      <div className="checkbox-field">
        <input
          id="filter-available"
          type="checkbox"
          checked={availableOnly}
          onChange={(e) => onAvailableOnlyChange(e.target.checked)}
        />
        <label htmlFor="filter-available">Лише в наявності</label>
      </div>

      <AppButton variant="secondary" onClick={onReset}>
        Скинути фільтри
      </AppButton>
    </div>
  )
}