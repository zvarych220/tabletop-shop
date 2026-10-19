import { Link } from 'react-router'
import useFavorites from '../hooks/useFavorites.js'
import { useProducts } from '../hooks/useProducts.js'
import BoardGameCard from '../components/games/BoardGameCard.jsx'

export default function FavoritesPage() {
  const { products } = useProducts()
  const { favorites, favoritesCount, clearFavorites } = useFavorites()

  const favoriteGames = products.filter((game) => favorites.includes(game.id))

  async function handleClearAll() {
    if (window.confirm('Ви впевнені, що хочете очистити весь список обраного?')) {
      await clearFavorites()
    }
  }

  if (favoritesCount === 0) {
    return (
      <div className="favorites-page-container">
        <div className="favorites-empty-state">
          <div className="empty-state-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h2 className="empty-state-title">Ваш список обраного порожній</h2>
          <p className="empty-state-desc">
            Додайте настільні ігри до списку бажань, натиснувши на іконку ♡ на картці товару.
          </p>
          <Link to="/games" className="empty-state-btn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Перейти до каталогу
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-page-container">
      <div className="favorites-header">
        <div>
          <h1 className="favorites-title">Список обраного</h1>
          <p className="favorites-count">
            {favoritesCount} {favoritesCount === 1 ? 'товар' : favoritesCount < 5 ? 'товари' : 'товарів'}
          </p>
        </div>
        <button
          type="button"
          className="favorites-clear-btn"
          onClick={handleClearAll}
        >
          Очистити список
        </button>
      </div>

      <div className="games-grid">
        {favoriteGames.map((game) => (
          <BoardGameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}
