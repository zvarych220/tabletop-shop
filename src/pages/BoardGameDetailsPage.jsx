import { useState } from 'react'
import { Link, useParams } from 'react-router'
import NotFoundPage from './NotFoundPage.jsx'
import useCart from '../hooks/useCart.js'
import {
  UsersIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
  RotateCcwIcon,
  CheckIcon,
  ParcelIcon,
  PostIcon,
  CreditCardIcon,
  CashIcon,
} from '../components/ui/Icons.jsx'

export default function BoardGameDetailsPage({ items }) {
  const { gameId } = useParams()
  const { addToCart } = useCart()

  const game = items.find((entry) => entry.id === gameId)

  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('desc') // 'desc' | 'components' | 'reviews'
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  if (!game) {
    return (
      <NotFoundPage
        title="Гру не знайдено"
        message={`Гру з ідентифікатором «${gameId}» не знайдено в каталозі магазину.`}
      />
    )
  }

  // Gallery images (main + detail shots)
  const gallery = [
    game.image,
    'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585504198199-20277593b94f?auto=format&fit=crop&w=800&q=80',
  ]

  // Related games (exclude current)
  const relatedGames = items.filter((g) => g.id !== game.id).slice(0, 4)

  function handleAddToCart() {
    addToCart(game, quantity)
  }

  return (
    <div className="product-details-page">
      {/* Breadcrumbs */}
      <nav aria-label="Хлібні крихти" className="product-breadcrumbs">
        <Link to="/" className="bc-link">Головна</Link>
        <span className="bc-sep">/</span>
        <Link to="/games" className="bc-link">Каталог</Link>
        <span className="bc-sep">/</span>
        <span className="bc-cat">{game.category}</span>
        <span className="bc-sep">/</span>
        <span className="bc-current" aria-current="page">{game.title}</span>
      </nav>

      {/* Main Product Layout (Screenshot 3) */}
      <div className="product-main-grid">
        {/* Left: Gallery */}
        <div className="product-gallery-col">
          <div className="product-main-image-wrap">
            {game.discount && (
              <span className="product-gallery-sale-badge">Sale {game.discount}</span>
            )}
            <img
              src={gallery[activeImageIndex] || game.image}
              alt={game.title}
              className="product-main-image"
            />
          </div>

          <div className="product-thumbnails-row">
            {gallery.map((imgSrc, idx) => (
              <button
                key={idx}
                type="button"
                className={`product-thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`Переглянути зображення ${idx + 1}`}
              >
                <img src={imgSrc} alt="" className="product-thumb-img" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="product-summary-col">
          <div className="product-category-tag">{game.category}</div>
          <h1 className="product-headline">{game.title}</h1>

          <div className="product-rating-row">
            <span className="product-stars">
              {'★'.repeat(game.rating || 5)}
              {'☆'.repeat(Math.max(0, 5 - (game.rating || 5)))}
            </span>
            <span className="product-reviews-count">({game.ratingCount || 142} відгуки покупців)</span>
          </div>

          <div className="product-price-block">
            {game.oldPrice && (
              <span className="product-price-old">{game.oldPrice} ₴</span>
            )}
            <span className="product-price-current">{game.price} ₴</span>
            <span className={`product-stock-badge ${game.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {game.inStock ? '✓ В наявності' : 'Під замовлення'}
            </span>
          </div>

          <p className="product-short-desc">{game.description}</p>

          <div className="product-specs-pills">
            <div className="spec-pill">
              <UsersIcon size={16} />
              <span>{game.players}</span>
            </div>
            <div className="spec-pill">
              <ClockIcon size={16} />
              <span>{game.playTime}</span>
            </div>
            <div className="spec-pill">
              <span>🇺🇦 Українська мова</span>
            </div>
          </div>

          {/* Add to Cart Controls */}
          <div className="product-purchase-row">
            <div className="product-qty-stepper">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Зменшити кількість"
              >
                −
              </button>
              <span className="qty-number">{quantity}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                aria-label="Збільшити кількість"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="product-add-cart-btn"
              onClick={handleAddToCart}
            >
              Додати в кошик • {game.price * quantity} ₴
            </button>
          </div>

          <div className="product-wishlist-row">
            <button
              type="button"
              className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={() => setIsWishlisted((prev) => !prev)}
            >
              <span>{isWishlisted ? '♥' : '♡'}</span>
              <span>{isWishlisted ? 'В обраному' : 'Додати до списку бажань'}</span>
            </button>
          </div>

          {/* Perks */}
          <div className="product-perks-list">
            <div className="product-perk-item">
              <TruckIcon size={18} className="perk-icon" />
              <span><strong>Безкоштовна доставка</strong> при замовленні від 1500 ₴</span>
            </div>
            <div className="product-perk-item">
              <ShieldCheckIcon size={18} className="perk-icon" />
              <span><strong>100% ліцензійне оригінальне видання</strong> найвищої якості</span>
            </div>
            <div className="product-perk-item">
              <RotateCcwIcon size={18} className="perk-icon" />
              <span><strong>Гарантія повної комплектації</strong> та обмін 14 днів</span>
            </div>
          </div>

          {/* Safe checkout & delivery badges */}
          <div className="product-guarantee-box">
            <span className="guarantee-title">ОФІЦІЙНА ДОСТАВКА ТА ОПЛАТА:</span>
            <div className="carrier-badges-row">
              <span className="carrier-badge"><ParcelIcon size={14} className="badge-icon-svg" /> Нова Пошта</span>
              <span className="carrier-badge"><PostIcon size={14} className="badge-icon-svg" /> Укрпошта</span>
              <span className="payment-badge"><CreditCardIcon size={14} className="badge-icon-svg" /> Visa / Mastercard</span>
              <span className="payment-badge"><CashIcon size={14} className="badge-icon-svg" /> При отриманні</span>
            </div>
          </div>

          <div className="product-meta-details">
            <div className="meta-line">
              <span className="meta-label">Артикул:</span>
              <span className="meta-val">DND-0{game.id.replace('game-', '')}</span>
            </div>
            <div className="meta-line">
              <span className="meta-label">Категорія:</span>
              <span className="meta-val">{game.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs (Description / Rules / Reviews) */}
      <div className="product-tabs-section">
        <div className="product-tabs-nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'desc'}
            className={`tab-nav-btn ${activeTab === 'desc' ? 'active' : ''}`}
            onClick={() => setActiveTab('desc')}
          >
            Опис гри
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'components'}
            className={`tab-nav-btn ${activeTab === 'components' ? 'active' : ''}`}
            onClick={() => setActiveTab('components')}
          >
            Комплектація та правила
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reviews'}
            className={`tab-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Відгуки ({game.ratingCount || 142})
          </button>
        </div>

        <div className="product-tab-content">
          {activeTab === 'desc' && (
            <div className="tab-pane">
              <p className="tab-paragraph">
                «{game.title}» — це визнаний шедевр у жанрі {game.category.toLowerCase()}, який подарує вам
                незабутні години тактичних рішень, інтриги та азарту. Гра ідеально збалансована для {game.players},
                а партія триває приблизно {game.playTime}.
              </p>
              <p className="tab-paragraph">
                Видання повністю перекладено українською мовою. Коробка містить високоякісні компоненти,
                дерева або пластикові мініатюри, щільні карти з художніми ілюстраціями та буклет з чіткими правилами.
              </p>
            </div>
          )}

          {activeTab === 'components' && (
            <div className="tab-pane">
              <h4 className="tab-subheading">Вміст коробки:</h4>
              <ul className="components-list">
                <li><CheckIcon size={14} /> 1 велике ігрове поле преміальної якості</li>
                <li><CheckIcon size={14} /> Повний набір художніх карт із щільним лляним тисненням</li>
                <li><CheckIcon size={14} /> Комплект дерев'яних фішок та маркерів гравців</li>
                <li><CheckIcon size={14} /> Жетони ресурсів та переможних балів</li>
                <li><CheckIcon size={14} /> Детальна книга правил українською мовою з прикладами</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-pane">
              <div className="reviews-list">
                <div className="review-item">
                  <div className="review-header">
                    <strong>Максим К.</strong>
                    <span className="review-stars">★★★★★</span>
                    <span className="review-date">2 дні тому</span>
                  </div>
                  <p className="review-text">
                    Неймовірна гра! Доставка Новою Поштою прибула наступного дня, запаковано було в бронебійну пупирку.
                    Правила зрозумілі, грали вже три вечори поспіль!
                  </p>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <strong>Олена В.</strong>
                    <span className="review-stars">★★★★★</span>
                    <span className="review-date">Тиждень тому</span>
                  </div>
                  <p className="review-text">
                    Якість компонентів на найвищому рівні. Купували на подарунок другові, дуже задоволені!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid (Screenshot 4) */}
      <section className="related-products-section">
        <h2 className="related-section-title">СХОЖІ НАСТІЛЬНІ ІГРИ</h2>
        <div className="related-products-grid">
          {relatedGames.map((relGame) => (
            <div key={relGame.id} className="related-card">
              <div className="related-img-wrap">
                <img src={relGame.image} alt={relGame.title} className="related-img" />
              </div>
              <h3 className="related-title">
                <Link to={`/games/${relGame.id}`}>{relGame.title}</Link>
              </h3>
              <div className="related-stars">
                {'★'.repeat(relGame.rating || 5)}
                {'☆'.repeat(Math.max(0, 5 - (relGame.rating || 5)))}
              </div>
              <span className="related-price">{relGame.price} ₴</span>
              <button
                type="button"
                className="related-add-btn"
                onClick={() => addToCart(relGame, 1)}
              >
                В кошик
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}