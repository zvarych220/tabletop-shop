import { useState } from 'react'
import { Link } from 'react-router'
import useCart from '../../hooks/useCart.js'

export default function BoardGameCard({ game }) {
  const { addToCart } = useCart()
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <article className="lab-catalog-card">
      <div className="lab-catalog-img-wrap">
        <button
          type="button"
          className={`card-wishlist-heart ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            setIsWishlisted((prev) => !prev)
          }}
          aria-label={isWishlisted ? 'Видалити з обраного' : 'Додати в обране'}
        >
          {isWishlisted ? '♥' : '♡'}
        </button>

        {game.discount && (
          <span className="lab-sale-badge">Sale {game.discount}</span>
        )}

        <Link to={`/games/${game.id}`} className="card-img-link">
          <img
            src={game.image}
            alt={game.title}
            className="card-photo-img"
            loading="lazy"
          />
        </Link>
      </div>

      <div className="lab-catalog-body">
        <span className="card-cat-label">{game.category}</span>

        <h3 className="lab-catalog-title">
          <Link to={`/games/${game.id}`}>{game.title}</Link>
        </h3>

        <div className="card-stars-row" aria-label={`Рейтинг ${game.rating || 5} з 5`}>
          <span className="card-stars-visual">
            {'★'.repeat(game.rating || 5)}
            {'☆'.repeat(Math.max(0, 5 - (game.rating || 5)))}
          </span>
          <span className="card-reviews-count">({game.ratingCount || 100})</span>
        </div>

        <div className="lab-catalog-price-row">
          {game.oldPrice && <span className="lab-price-old">{game.oldPrice} ₴</span>}
          <span className="lab-price-current">{game.price} ₴</span>
        </div>

        <div className="lab-catalog-card-actions">
          <button
            type="button"
            className="lab-catalog-add-btn"
            onClick={() => addToCart(game, 1)}
          >
            В кошик
          </button>
          <Link to={`/games/${game.id}`} className="lab-catalog-details-btn">
            Деталі
          </Link>
        </div>
      </div>
    </article>
  )
}