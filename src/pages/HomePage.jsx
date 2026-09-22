import Section from '../components/ui/Section.jsx'
import CatalogSummary from '../components/games/CatalogSummary.jsx'
import BoardGameFilters from '../components/games/BoardGameFilters.jsx'
import BoardGameList from '../components/games/BoardGameList.jsx'
import useBoardGameFilters from '../hooks/useBoardGameFilters.js'

export default function HomePage({ items, selectedId, onSelect }) {
  const {
    query,
    setQuery,
    availableOnly,
    setAvailableOnly,
    visibleItems,
    resetFilters,
  } = useBoardGameFilters(items)

  return (
    <>
      <Section id="about" title="Про магазин «Dice & Deck»">
        <p>
          Обирайте найкращі настільні ігри для вечірок та турнірів. Скористайтеся фільтром
          нижче, оберіть гру та сформуйте чернетку заявки.
        </p>
      </Section>

      <Section id="catalog" title="Каталог настільних ігор">
        <CatalogSummary total={items.length} />

        <BoardGameFilters
          query={query}
          availableOnly={availableOnly}
          onQueryChange={setQuery}
          onAvailableOnlyChange={setAvailableOnly}
          onReset={resetFilters}
        />

        <p className="items-count-badge">Показано ігор: {visibleItems.length}</p>

        <BoardGameList
          items={visibleItems}
          selectedId={selectedId}
          onSelect={onSelect}
          emptyTitle="За вашим запитом ігор не знайдено"
        />
      </Section>
    </>
  )
}