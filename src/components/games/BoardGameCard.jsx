import { useState } from 'react'
import { Link } from 'react-router'
import useCart from '../../hooks/useCart.js'
import useFavorites from '../../hooks/useFavorites.js'

/**
 * Unified product card used in the catalog and on the home page.
 *
 * Props:
 *   game        – board game object from boardGames.js (required)
 *   selected    – highlight the card (optional, catalog use)
 *   onSelect    – callback when card is selected (optional, catalog use)
 *   showQty     – show +/− quantity controls and a combined "В кошик • X ₴" button
 *                 instead of the two-button layout (optional, home-page use)
 */
export default function BoardGameCard({ game, selected, onSelect, showQty = false }) {
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [qty, setQty] = useState(1)

  const isWishlisted = isFavorite(game.id)

  function decrement() {
    setQty((prev) => (prev > 1 ? prev - 1 : 1))
  }

  function increment() {
    setQty((prev) => (prev < 8 ? prev + 1 : prev))
  }

  return (
    <article
      className={`lab-catalog-card${selected ? ' lab-catalog-card--selected' : ''}`}
      onClick={onSelect ? () => onSelect(game.id) : undefined}
    >
      <div className="lab-catalog-img-wrap">
        <button
          type="button"
          className={`card-wishlist-heart ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleFavorite(game.id)
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
        {game.category && (
          <span className="card-cat-label">{game.category}</span>
        )}

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

        {showQty ? (
          <>
            <div className="lab-qty-row">
              <button
                type="button"
                className="lab-qty-btn"
                onClick={decrement}
                aria-label="Зменшити кількість"
              >
                −
              </button>
              <span className="lab-qty-val">{qty}</span>
              <button
                type="button"
                className="lab-qty-btn"
                onClick={increment}
                aria-label="Збільшити кількість"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => addToCart(game, qty)}
              className="lab-catalog-add-btn"
            >
              В кошик • {game.price * qty} ₴
            </button>
          </>
        ) : (
          <div className="lab-catalog-card-actions">
            <button
              type="button"
              className="lab-catalog-add-btn"
              onClick={(e) => {
                e.stopPropagation()
                addToCart(game, 1)
              }}
            >
              В кошик
            </button>
            <Link
              to={`/games/${game.id}`}
              className="lab-catalog-details-btn"
              onClick={(e) => e.stopPropagation()}
            >
              Деталі
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}