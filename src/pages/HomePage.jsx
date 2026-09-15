import BoardGameCard from '../components/BoardGameCard.jsx'
import { boardGames } from '../data/boardGames.js'

export default function HomePage() {
  return (
    <main className="main-container">
      <section id="about" className="section-hero">
        <h2>Магазин настільних ігор «Dice & Deck»</h2>
        <p>
          Твій гід у світі сучасних настілок. Обирай ігри для гучних вечірок, затишних
          сімейних вечорів або глибоких баталій на кілька годин.
        </p>
      </section>

      <section id="catalog" className="section-catalog">
        <div className="catalog-header">
          <h2>Каталог ігор</h2>
          <span className="items-badge">Знайдено: {boardGames.length}</span>
        </div>

        {boardGames.length === 0 ? (
          <p className="empty-catalog-message">
            Наразі каталог порожній. Завітайте пізніше або зверніться до менеджера.
          </p>
        ) : (
          <div className="games-grid">
            {boardGames.map((game) => (
              <BoardGameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}