import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router'
import NotFoundPage from './NotFoundPage.jsx'
import useCart from '../hooks/useCart.js'
import useFavorites from '../hooks/useFavorites.js'
import useAuth from '../hooks/useAuth.js'
import { useProducts } from '../hooks/useProducts.js'
import { api } from '../services/api.js'
import BoardGameCard from '../components/games/BoardGameCard.jsx'
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
  StarFilledIcon,
  MessageSquareIcon,
} from '../components/ui/Icons.jsx'

const LOCAL_REVIEWS_STORAGE_KEY = 'tabletop_local_reviews'

function getLocalReviews() {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    return []
  }
}

function saveLocalReviews(list) {
  try {
    localStorage.setItem(LOCAL_REVIEWS_STORAGE_KEY, JSON.stringify(list))
  } catch (err) {
    console.error('Failed to save local reviews:', err)
  }
}

const RATING_LABELS = {
  1: 'Погано (1/5)',
  2: 'Так собі (2/5)',
  3: 'Нормально (3/5)',
  4: 'Добре (4/5)',
  5: 'Відмінно! (5/5)',
}

function formatReviewDate(dateStr) {
  if (!dateStr) return 'Нещодавно'
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Сьогодні'
    if (diffDays === 1) return 'Вчора'
    if (diffDays < 7) return `${diffDays} дні тому`
    return new Intl.DateTimeFormat('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch (e) {
    return 'Нещодавно'
  }
}

export default function BoardGameDetailsPage() {
  const { gameId } = useParams()
  const { products } = useProducts()
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { user } = useAuth()

  const game = products.find((entry) => entry.id === gameId)

  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('desc') // 'desc' | 'components' | 'reviews'
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [authorName, setAuthorName] = useState('')
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  // Prefill author name if user logs in
  useEffect(() => {
    if (user && !authorName) {
      setAuthorName(user.name || user.email || '')
    }
  }, [user, authorName])

  // Load reviews: approved from API + pending from local storage
  const loadReviews = useCallback(async () => {
    if (!game?.id) return
    setIsLoadingReviews(true)
    try {
      const serverData = await api.reviews.getByProduct(game.id)
      const approvedList = Array.isArray(serverData) ? serverData : (serverData?.data || [])

      // Local reviews
      const localList = getLocalReviews()
      const serverIds = new Set(approvedList.map((r) => r.id))

      // Clean up local reviews that have now been approved
      const updatedLocal = localList.filter((lr) => !serverIds.has(lr.id))
      if (updatedLocal.length !== localList.length) {
        saveLocalReviews(updatedLocal)
      }

      // Find pending reviews for this game submitted on this device
      const pendingForThisGame = updatedLocal.filter(
        (lr) => lr.productId === game.id && lr.status === 'pending'
      )

      // Submitting user sees their own pending review right at the top
      setReviews([...pendingForThisGame, ...approvedList])
    } catch (err) {
      console.error('Failed to load reviews:', err)
      const localList = getLocalReviews().filter(
        (lr) => lr.productId === game.id && lr.status === 'pending'
      )
      setReviews(localList)
    } finally {
      setIsLoadingReviews(false)
    }
  }, [game?.id])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!authorName.trim()) {
      setReviewError("Будь ласка, вкажіть ваше ім'я")
      return
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setReviewError('Текст відгуку має містити щонайменше 5 символів')
      return
    }

    setIsSubmittingReview(true)
    setReviewError('')
    setReviewSuccess('')

    try {
      const res = await api.reviews.create(game.id, {
        authorName: authorName.trim(),
        rating,
        comment: comment.trim(),
      })

      const createdReview = res?.data || res || {
        id: 'rev-' + Math.random().toString(36).substr(2, 9),
        productId: game.id,
        authorName: authorName.trim(),
        rating,
        comment: comment.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      }

      createdReview.status = 'pending'
      createdReview.productId = game.id

      // Save to localStorage so user doesn't lose it and sees it immediately
      const currentLocal = getLocalReviews()
      const withoutDup = currentLocal.filter((r) => r.id !== createdReview.id)
      saveLocalReviews([createdReview, ...withoutDup])

      // Add to visible reviews list for this user immediately
      setReviews((prev) => [createdReview, ...prev.filter((r) => r.id !== createdReview.id)])
      setComment('')
      setReviewSuccess('Дякуємо! Ваш відгук успішно додано та надіслано на перевірку адміністратором.')
    } catch (err) {
      console.error('Failed to submit review:', err)
      // Even if network or API has an issue, persist locally so user has no suspicion of loss
      const fallbackReview = {
        id: 'rev-local-' + Date.now(),
        productId: game.id,
        authorName: authorName.trim(),
        rating,
        comment: comment.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      const currentLocal = getLocalReviews()
      saveLocalReviews([fallbackReview, ...currentLocal])
      setReviews((prev) => [fallbackReview, ...prev])
      setComment('')
      setReviewSuccess('Дякуємо! Ваш відгук збережено.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const isWishlisted = isFavorite(game?.id || '')

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
  const relatedGames = products.filter((g) => g.id !== game.id).slice(0, 4)

  function handleAddToCart() {
    addToCart(game, quantity)
  }

  const roundedRating = Math.min(5, Math.max(1, Math.round(Number(game.rating || 5))))
  const totalReviewsCount = reviews.length

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

      {/* Main Product Layout */}
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
              {'★'.repeat(roundedRating)}
              {'☆'.repeat(5 - roundedRating)}
            </span>
            <span className="product-reviews-count">
              ({totalReviewsCount}{' '}
              {totalReviewsCount === 1
                ? 'відгук'
                : totalReviewsCount >= 2 && totalReviewsCount <= 4
                ? 'відгуки'
                : 'відгуків'}{' '}
              покупців)
            </span>
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
          </div>

          {/* Action Row: Quantity + Add to Cart + Wishlist */}
          <div className="product-actions-group">
            <div className="quantity-selector-box">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Зменшити кількість"
              >
                -
              </button>
              <span className="qty-val">{quantity}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => q + 1)}
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
              До кошика
            </button>

            <button
              type="button"
              className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={() => toggleFavorite(game.id)}
              aria-label={isWishlisted ? 'Видалити зі списку бажань' : 'Додати до списку бажань'}
            >
              {isWishlisted ? '❤' : '♡'}
            </button>
          </div>

          {/* Trust Perks */}
          <div className="product-perks-list">
            <div className="product-perk-item">
              <TruckIcon size={18} className="perk-icon" />
              <span><strong>Швидка доставка</strong> по всій Україні 1-2 дні</span>
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
              <span className="meta-val">DND-0{String(game.id).replace('game-', '')}</span>
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
            Відгуки ({totalReviewsCount})
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
                {isLoadingReviews ? (
                  <p style={{ color: '#64748b' }}>Завантаження відгуків...</p>
                ) : reviews.length === 0 ? (
                  <div className="review-empty-box">
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      Ще немає опублікованих відгуків про цю гру.
                    </p>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
                      Будьте першим, хто поділиться своїми враженнями від партій!
                    </p>
                  </div>
                ) : (
                  reviews.map((rev) => {
                    const isPending = rev.status === 'pending'
                    const starsCount = Math.min(5, Math.max(1, Math.round(Number(rev.rating || 5))))

                    return (
                      <div
                        key={rev.id || `${rev.authorName}-${rev.createdAt}`}
                        className={`review-item ${isPending ? 'is-pending' : ''}`}
                      >
                        <div className="review-header">
                          <strong>{rev.authorName}</strong>
                          <span className="review-stars">
                            {'★'.repeat(starsCount)}
                            {'☆'.repeat(5 - starsCount)}
                          </span>
                          <span className="review-date">{formatReviewDate(rev.createdAt)}</span>
                          {isPending && (
                            <span
                              className="review-pending-badge"
                              title="Ваш відгук надіслано на перевірку модератором"
                            >
                              ⏳ Ваш відгук (на модерації)
                            </span>
                          )}
                        </div>
                        <p className="review-text">{rev.comment}</p>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Add Review Form */}
              <div className="review-form-card">
                <h3 className="review-form-title">Залишити відгук про гру</h3>
                <p className="review-form-subtitle">
                  Поділіться враженнями від ігрового процесу, правил та якості компонентів.
                </p>

                {reviewSuccess && (
                  <div className="review-alert-success">
                    {reviewSuccess}
                  </div>
                )}

                {reviewError && (
                  <div className="review-alert-error">
                    {reviewError}
                  </div>
                )}

                <form onSubmit={handleSubmitReview}>
                  {/* Star Rating Picker */}
                  <div className="review-form-field">
                    <label className="review-form-label">Ваша оцінка:</label>
                    <div className="review-star-picker-wrap">
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map((starVal) => {
                          const isHovered = hoveredRating >= starVal
                          const isSelected = !hoveredRating && rating >= starVal
                          return (
                            <button
                              key={starVal}
                              type="button"
                              className={`review-star-btn ${
                                isHovered ? 'hovered' : isSelected ? 'active' : ''
                              }`}
                              onMouseEnter={() => setHoveredRating(starVal)}
                              onMouseLeave={() => setHoveredRating(0)}
                              onClick={() => setRating(starVal)}
                              aria-label={`Оцінити на ${starVal} з 5`}
                            >
                              ★
                            </button>
                          )
                        })}
                      </div>
                      <span className="review-star-label">
                        {RATING_LABELS[hoveredRating || rating]}
                      </span>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="review-form-field">
                    <label htmlFor="review-author" className="review-form-label">
                      Ваше ім'я або псевдонім:
                    </label>
                    <input
                      id="review-author"
                      type="text"
                      className="review-form-input"
                      placeholder="Наприклад: Олександр"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Comment Textarea */}
                  <div className="review-form-field">
                    <label htmlFor="review-comment" className="review-form-label">
                      Ваш відгук:
                    </label>
                    <textarea
                      id="review-comment"
                      className="review-form-textarea"
                      rows="4"
                      placeholder="Що вам сподобалося найбільше? Для якої компанії підійде гра?.."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="review-form-submit-btn"
                  >
                    {isSubmittingReview ? 'Надсилання...' : 'Надіслати відгук'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="related-products-section">
        <h2 className="related-section-title">СХОЖІ НАСТІЛЬНІ ІГРИ</h2>
        <div className="games-grid">
          {relatedGames.map((relGame) => (
            <BoardGameCard key={relGame.id} game={relGame} />
          ))}
        </div>
      </section>
    </div>
  )
}