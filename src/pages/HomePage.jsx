import { useState } from 'react'
import { Link } from 'react-router'
import { boardGames } from '../data/boardGames.js'
import useCart from '../hooks/useCart.js'
import {
  DiceIcon,
  ShieldCheckIcon,
  TruckIcon,
  MessageSquareIcon,
  RotateCcwIcon,
  ChessKnightIcon,
  SwordsIcon,
  CrownIcon,
  CalendarIcon,
  UserCircleIcon,
} from '../components/ui/Icons.jsx'

function HomeProductCard({ game }) {
  const [qty, setQty] = useState(1)
  const { addToCart } = useCart()

  function decrement() {
    setQty((prev) => (prev > 1 ? prev - 1 : 1))
  }

  function increment() {
    setQty((prev) => (prev < 8 ? prev + 1 : prev))
  }

  return (
    <div className="lab-product-card">
      <div className="lab-product-img-wrap">
        {game.discount && <span className="lab-sale-badge">Sale {game.discount}</span>}
        <img
          src={game.image}
          alt={game.title}
          className="lab-product-img"
          loading="lazy"
        />
      </div>

      <div className="lab-product-info">
        <h3 className="lab-product-title">
          <Link to={`/games/${game.id}`}>{game.title}</Link>
        </h3>

        <div className="lab-product-stars" aria-label={`Рейтинг ${game.rating || 5} з 5`}>
          {'★'.repeat(game.rating || 5)}
          {'☆'.repeat(Math.max(0, 5 - (game.rating || 5)))}
        </div>

        <div className="lab-product-price-row">
          {game.oldPrice && (
            <span className="lab-price-old">{game.oldPrice} ₴</span>
          )}
          <span className="lab-price-current">{game.price} ₴</span>
        </div>

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
          className="lab-add-btn"
        >
          В кошик • {game.price * qty} ₴
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="labubu-styled-home">
      {/* 1. Hero Split Section (Screenshot 1) */}
      <section className="lab-hero-split">
        <div className="lab-hero-left">
          <span className="lab-hero-tag">DICE & DECK • TABLETOP CLUB</span>
          <h1 className="lab-hero-title">
            ROLL THE DICE, <br />
            CLAIM THE REALM
          </h1>
          <div className="lab-hero-hearts" aria-hidden="true">
            ❤❤❤❤❤
          </div>
          <p className="lab-hero-desc">
            Культові настільні ігри, стратегічні баталії та затишні вечори з друзями.
            Обирайте офіційні ліцензійні видання або бронюйте гру в клубі.
          </p>
          <Link to="/games" className="lab-hero-cta">
            До каталогу
          </Link>
        </div>

        <div className="lab-hero-right-grid">
          <div className="lab-hero-grid-item">
            <img
              src="https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80"
              alt="Настільна гра з кубиками"
              className="lab-grid-img"
            />
          </div>
          <div className="lab-hero-grid-item">
            <img
              src="https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=800&q=80"
              alt="Компоненти настільної гри"
              className="lab-grid-img"
            />
          </div>
          <div className="lab-hero-grid-item">
            <img
              src="https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&w=800&q=80"
              alt="Карткова партія"
              className="lab-grid-img"
            />
          </div>
          <div className="lab-hero-grid-item">
            <img
              src="https://images.unsplash.com/photo-1585504198199-20277593b94f?auto=format&fit=crop&w=800&q=80"
              alt="Гральні кістки для RPG"
              className="lab-grid-img"
            />
          </div>
        </div>
      </section>

      {/* 2. Central Teaser with Avatar (Screenshot 1 bottom) */}
      <section className="lab-teaser-center">
        <div className="lab-teaser-avatar-wrap">
          <div className="lab-avatar-circle">
            <DiceIcon size={38} className="lab-avatar-icon" />
          </div>
        </div>
        <h2 className="lab-teaser-title">
          МИСТЕЦТВО СТРАТЕГІЇ, СТИЛЬ ТА АЗАРТ
        </h2>
        <div className="lab-teaser-dots" aria-hidden="true">
          <span>●</span>
          <span>●</span>
          <span>●</span>
          <span>●</span>
          <span>●</span>
        </div>
      </section>

      {/* 3. Feature Showcase Section (Screenshot 2 top) */}
      <section className="lab-feature-split">
        <div className="lab-feature-visual">
          <div className="lab-blob-bg" aria-hidden="true"></div>
          <img
            src="https://images.unsplash.com/photo-1563941402622-4e7a488bcc57?auto=format&fit=crop&w=800&q=80"
            alt="Фігурки настільних ігор"
            className="lab-feature-cutout"
          />
        </div>

        <div className="lab-feature-content">
          <h2 className="lab-section-heading">
            ДЕ ЖИВЕ ТВОЯ <br />
            УЛЮБЛЕНА ГРА
          </h2>
          <p className="lab-feature-lead">
            Кожна коробка в Dice & Deck — це ретельно відібрана історія, новий всесвіт
            та незабутній досвід для тебе і твоїх близьких.
          </p>

          <ul className="lab-feature-bullets">
            <li>
              <span className="lab-bullet-dot"></span>
              <span>Колекційні стратегії та світові бестселери</span>
            </li>
            <li>
              <span className="lab-bullet-dot"></span>
              <span>Швидкі паті-ігри для гучних вечірок</span>
            </li>
            <li>
              <span className="lab-bullet-dot"></span>
              <span>Тільки ліцензійні українські видання та переклади</span>
            </li>
            <li>
              <span className="lab-bullet-dot"></span>
              <span>Безкоштовні консультації гейм-майстрів з правил</span>
            </li>
          </ul>

          <Link to="/games" className="lab-action-btn">
            Обрати гру
          </Link>
        </div>
      </section>

      {/* 4. Full-Width Mosaic Grid Banner (Screenshot 2 bottom) */}
      <section className="lab-mosaic-banner">
        <div className="lab-mosaic-grid">
          <div className="lab-mosaic-tile">
            <img
              src="https://images.unsplash.com/photo-1632501641765-e568d28b0015?auto=format&fit=crop&w=600&q=80"
              alt="Гравці за столом"
            />
          </div>
          <div className="lab-mosaic-tile">
            <img
              src="https://images.unsplash.com/photo-1578374173705-969cbe6f2d6b?auto=format&fit=crop&w=600&q=80"
              alt="Картковий розклад"
            />
          </div>
          <div className="lab-mosaic-tile">
            <img
              src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80"
              alt="Елементи гри"
            />
          </div>
          <div className="lab-mosaic-tile">
            <img
              src="https://images.unsplash.com/photo-1610890716093-f14d8eb01007?auto=format&fit=crop&w=600&q=80"
              alt="Мініатюри"
            />
          </div>
        </div>

        <div className="lab-mosaic-overlay">
          <h2 className="lab-mosaic-title">
            ВІДЧУЙ КОЖЕН ХІД. ЖИВИ ГРОЮ.
          </h2>
          <p className="lab-mosaic-sub">
            Справжні емоції перемагають будь-який екран. Знайди свій наступний шедевр.
          </p>
          <Link to="/games" className="lab-action-btn lab-action-btn-light">
            Перейти в каталог
          </Link>
        </div>
      </section>

      {/* 5. Product Grid "OUR GAMES" (Screenshot 3) */}
      <section className="lab-products-section">
        <div className="lab-section-header">
          <h2 className="lab-section-heading">ТОП НАСТІЛЬНИХ ІГОР</h2>
          <p className="lab-section-sub">
            Найпопулярніші хіти клубу Dice & Deck із можливістю швидкого замовлення.
          </p>
        </div>

        <div className="lab-products-grid">
          {boardGames.map((game) => (
            <HomeProductCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* 6. Secondary Promo Split (Screenshot 4 top) */}
      <section className="lab-promo-split">
        <div className="lab-promo-content">
          <h2 className="lab-section-heading">
            ГОТОВИЙ ДО НОВОЇ <br />
            ПАРТІЇ З ДРУЗЯМИ?
          </h2>
          <p className="lab-promo-desc">
            Обирай гру вже зараз або залиш заявку на консультацію з гейм-майстром.
            Ми допоможемо розібратися в правилах та підготувати все до ідеального вечора.
          </p>
          <Link to="/orders" className="lab-action-btn">
            Переглянути заявки
          </Link>
        </div>

        <div className="lab-promo-visual">
          <div className="lab-blob-bg lab-blob-alt" aria-hidden="true"></div>
          <img
            src="https://images.unsplash.com/photo-1585504198199-20277593b94f?auto=format&fit=crop&w=800&q=80"
            alt="Золотий кубик D20"
            className="lab-promo-cutout"
          />
        </div>
      </section>

      {/* 7. Value Props "OUR SERVICES" (Screenshot 4 middle) */}
      <section className="lab-services-section">
        <div className="lab-section-header">
          <h2 className="lab-section-heading">НАШІ ПЕРЕВАГИ</h2>
          <p className="lab-section-sub">
            Чому сотні гравців обирають Dice & Deck для замовлення своїх улюблених настілок.
          </p>
        </div>

        <div className="lab-services-grid">
          <div className="lab-service-card">
            <div className="lab-service-icon-blob">
              <TruckIcon size={28} className="lab-service-svg" />
            </div>
            <h3 className="lab-service-title">ШВИДКА ДОСТАВКА</h3>
            <p className="lab-service-text">
              Відправляємо замовлення щодня по всій Україні. Безкоштовна доставка від 1500 ₴.
            </p>
            <Link to="/games" className="lab-service-link">
              Детальніше
            </Link>
          </div>

          <div className="lab-service-card">
            <div className="lab-service-icon-blob">
              <ShieldCheckIcon size={28} className="lab-service-svg" />
            </div>
            <h3 className="lab-service-title">100% ОРИГІНАЛ</h3>
            <p className="lab-service-text">
              Лише офіційні ліцензійні українські та англійські видання найвищої якості.
            </p>
            <Link to="/games" className="lab-service-link">
              Детальніше
            </Link>
          </div>

          <div className="lab-service-card">
            <div className="lab-service-icon-blob">
              <MessageSquareIcon size={28} className="lab-service-svg" />
            </div>
            <h3 className="lab-service-title">ПІДТРИМКА 24/7</h3>
            <p className="lab-service-text">
              Допомога професійного гейм-майстра з правил, складності та підбору замовлення.
            </p>
            <Link to="/orders/new" className="lab-service-link">
              Детальніше
            </Link>
          </div>

          <div className="lab-service-card">
            <div className="lab-service-icon-blob">
              <RotateCcwIcon size={28} className="lab-service-svg" />
            </div>
            <h3 className="lab-service-title">ЛЕГКЕ ПОВЕРНЕННЯ</h3>
            <p className="lab-service-text">
              Гарантія повної комплектації, заміна дефектних компонентів та повернення 14 днів.
            </p>
            <Link to="/games" className="lab-service-link">
              Детальніше
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Big Testimonial Quote (Screenshot 4 bottom) */}
      <section className="lab-quote-section">
        <span className="lab-quote-mark" aria-hidden="true">“</span>
        <blockquote className="lab-quote-text">
          НАСТІЛЬНІ ІГРИ — ЦЕ НЕ ПРОСТО КАРТОН І КУБИКИ. ЦЕ СПРАВЖНІ ЖИВІ ЕМОЦІЇ,
          ЩО ОБ'ЄДНУЮТЬ НАЙБЛИЖЧИХ ЛЮДЕЙ ЗА ОДНИМ СТОЛОМ.
        </blockquote>
        <div className="lab-quote-author">
          <strong>Олександр Мельник</strong> • Керівник клубу Dice & Deck
        </div>

        {/* Decorative player avatars around quote */}
        <div className="lab-floating-avatars" aria-hidden="true">
          <span className="lab-avatar-bubble lab-ab-1"><DiceIcon size={18} /></span>
          <span className="lab-avatar-bubble lab-ab-2"><ChessKnightIcon size={18} /></span>
          <span className="lab-avatar-bubble lab-ab-3"><SwordsIcon size={18} /></span>
          <span className="lab-avatar-bubble lab-ab-4"><CrownIcon size={18} /></span>
        </div>
      </section>

      {/* 9. Latest Posts (Screenshot 5 top) */}
      <section className="lab-posts-section">
        <div className="lab-section-header">
          <h2 className="lab-section-heading">ОСТАННІ ПУБЛІКАЦІЇ</h2>
          <p className="lab-section-sub">
            Огляди новинок, гайди зі стратегій та новини зі світу настільних ігор.
          </p>
        </div>

        <div className="lab-posts-grid">
          <article className="lab-post-card">
            <div className="lab-post-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80"
                alt="Пост про Дюну"
                className="lab-post-img"
              />
              <div className="lab-post-meta">
                <span><CalendarIcon size={13} className="post-meta-svg" /> 14 Жовтня, 2026</span>
                <span><UserCircleIcon size={13} className="post-meta-svg" /> Dice & Deck</span>
              </div>
            </div>
            <div className="lab-post-body">
              <h3 className="lab-post-title">
                ЧОМУ «ДЮНА: ІМПЕРІУМ» СТАЛА ГОЛОВНИМ ХІТОМ РОКУ
              </h3>
              <p className="lab-post-excerpt">
                Аналіз механік розміщення робітників та побудови колоди у культовій стратегії за всесвітом Арракіса.
              </p>
              <Link to="/games/game-001" className="lab-post-btn">
                Читати далі
              </Link>
            </div>
          </article>

          <article className="lab-post-card">
            <div className="lab-post-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&w=600&q=80"
                alt="Пост про паті-ігри"
                className="lab-post-img"
              />
              <div className="lab-post-meta">
                <span><CalendarIcon size={13} className="post-meta-svg" /> 10 Жовтня, 2026</span>
                <span><UserCircleIcon size={13} className="post-meta-svg" /> Dice & Deck</span>
              </div>
            </div>
            <div className="lab-post-body">
              <h3 className="lab-post-title">
                ТОП-5 ПАТІ-ІГОР, ЩО РОЗВЕСЕЛЯТЬ БУДЬ-ЯКУ КОМПАНІЮ
              </h3>
              <p className="lab-post-excerpt">
                Як розігріти вечірку за 15 хвилин: від асоціативних «Кодових Імен» до швидких детективних розслідувань.
              </p>
              <Link to="/games/game-002" className="lab-post-btn">
                Читати далі
              </Link>
            </div>
          </article>

          <article className="lab-post-card">
            <div className="lab-post-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80"
                alt="Пост про Крила"
                className="lab-post-img"
              />
              <div className="lab-post-meta">
                <span><CalendarIcon size={13} className="post-meta-svg" /> 05 Жовтня, 2026</span>
                <span><UserCircleIcon size={13} className="post-meta-svg" /> Dice & Deck</span>
              </div>
            </div>
            <div className="lab-post-body">
              <h3 className="lab-post-title">
                ФЕНОМЕН «КРИЛ»: ЯК ЗАТИШНА СІМЕЙНА ГРА ПІДКОРИЛА СВІТ
              </h3>
              <p className="lab-post-excerpt">
                Історія успіху авторки Елізабет Гаргрейв та секрети балансу чудових пташиних заповідників.
              </p>
              <Link to="/games/game-004" className="lab-post-btn">
                Читати далі
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}