import { Link } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import { DiceIcon, TrophyIcon, ZapIcon, SparklesIcon } from '../components/ui/Icons.jsx'

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-badge">
        <DiceIcon size={14} className="hero-badge-icon" />
        <span>Магазин та клуб настільних ігор</span>
      </div>

      <PageHeading title="Ласкаво просимо до «Dice & Deck»" />
      <p className="hero-text">
        Ваш надійний провідник у світ сучасних настільних ігор. Обирайте хіти світового
        рівня, бронюйте примірники або формуйте заявку на доставку.
      </p>

      <div className="home-actions">
        <Link to="/games" className="app-button app-button-primary home-primary-btn">
          <span>Перейти до каталогу ігор</span>
          <span className="btn-arrow" aria-hidden="true">→</span>
        </Link>
        <Link to="/orders" className="app-button app-button-secondary">
          <span>Переглянути замовлення</span>
        </Link>
      </div>

      <div className="hero-stats">
        <div className="stat-card">
          <span className="stat-number">4+</span>
          <span className="stat-label">Культові гри в каталозі</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">1-8+</span>
          <span className="stat-label">Гравців у партіях</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">100%</span>
          <span className="stat-label">Оригінальні локалізації</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">0 ₴</span>
          <span className="stat-label">Безкоштовна консультація</span>
        </div>
      </div>

      <div className="home-features">
        <div className="feature-card">
          <div className="feature-icon">
            <TrophyIcon size={24} className="feature-icon-svg" />
          </div>
          <h3 className="feature-title">Світові шедеври</h3>
          <p className="feature-desc">Від стратегічної «Дюни» до затишних «Крил» — лише перевірені часом та преміями ігри.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <ZapIcon size={24} className="feature-icon-svg" />
          </div>
          <h3 className="feature-title">Зручне бронювання</h3>
          <p className="feature-desc">Обирайте гру в один клік, заповнюйте побажання та миттєво відстежуйте стан чернетки.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <SparklesIcon size={24} className="feature-icon-svg" />
          </div>
          <h3 className="feature-title">Поради майстрів</h3>
          <p className="feature-desc">Потрібні протектори для карт або пояснення правил? Позначте у формі, і ми звʼяжемось з вами.</p>
        </div>
      </div>
    </div>
  )
}