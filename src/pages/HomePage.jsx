import Section from '../components/ui/Section.jsx'
import CatalogSummary from '../components/games/CatalogSummary.jsx'
import BoardGameList from '../components/games/BoardGameList.jsx'
import { boardGames } from '../data/boardGames.js'

export default function HomePage() {
  return (
    <>
      <Section id="about" title="Про магазин «Dice & Deck»">
        <p>
          Ми пропонуємо найкращі світові настільні хіти українською мовою. Обирайте гру за
          жанром, тривалістю чи складністю для власної колекції або на подарунок.
        </p>
      </Section>

      <Section id="catalog" title="Каталог настільних ігор">
        <CatalogSummary total={boardGames.length} />
        <BoardGameList items={boardGames} />
      </Section>
    </>
  )
}