import { useState } from 'react'
import { Outlet } from 'react-router'
import SiteHeader from './SiteHeader.jsx'
import BoardGameSelectionProvider from '../../providers/BoardGameSelectionProvider.jsx'
import OrdersProvider from '../../providers/OrdersProvider.jsx'
import CartProvider from '../../providers/CartProvider.jsx'
import CartDrawer from '../cart/CartDrawer.jsx'
import { DiceIcon, TelegramIcon, InstagramIcon, DiscordIcon, YouTubeIcon, CheckCircleIcon } from '../ui/Icons.jsx'

const navigationLinks = [
  { to: '/', label: 'Головна', end: true },
  { to: '/games', label: 'Каталог' },
  { to: '/orders', label: 'Замовлення' },
]

export default function AppLayout({ items }) {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(e) {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      setSubscribed(true)
      setNewsletterEmail('')
    }
  }

  return (
    <CartProvider>
      <div className="app-layout">
        <a className="skip-link" href="#main-content">Перейти до вмісту</a>
        <SiteHeader title="Dice & Deck" links={navigationLinks} />
        
        <main id="main-content" tabIndex={-1} className="main-container">
          <div className="main-container-inner">
            <BoardGameSelectionProvider items={items}>
              <OrdersProvider>
                <Outlet />
              </OrdersProvider>
            </BoardGameSelectionProvider>
          </div>
        </main>

        <CartDrawer />

        {/* Clean Modern 3-Column Footer without app store downloads */}
        <footer className="lab-site-footer">
          <div className="lab-footer-inner">
            <div className="lab-footer-grid">
              <div className="lab-footer-col">
                <h4 className="lab-footer-heading">ЗВ'ЯЖІТЬСЯ З НАМИ</h4>
                <p className="lab-footer-text">
                  Маєте питання щодо замовлення чи вибору гри? Наші консультанти готові допомогти щодня з 10:00 до 20:00.
                </p>
                <div className="lab-footer-contacts">
                  <a href="tel:+380442345678" className="lab-contact-link">+380 44 234 56 78</a>
                  <a href="mailto:info@dicedeck.ua" className="lab-contact-link">info@dicedeck.ua</a>
                  <span className="lab-contact-address">м. Київ, вул. Велика Васильківська, 42</span>
                </div>
              </div>

              <div className="lab-footer-col">
                <h4 className="lab-footer-heading">СПІЛЬНОТА НАСТІЛЬНИКІВ</h4>
                <p className="lab-footer-text">
                  Приєднуйтеся до нашої спільноти в соціальних мережах, читайте огляди нових локалізацій та беріть участь у турнірах.
                </p>

                <div className="lab-socials-row">
                  <span className="lab-social-circle" title="Telegram"><TelegramIcon size={18} /></span>
                  <span className="lab-social-circle" title="Instagram"><InstagramIcon size={18} /></span>
                  <span className="lab-social-circle" title="Discord"><DiscordIcon size={18} /></span>
                  <span className="lab-social-circle" title="YouTube"><YouTubeIcon size={18} /></span>
                </div>

                <div className="lab-delivery-partners-badge">
                  <span className="delivery-badge-tag">Доставка: Нова Пошта • Укрпошта</span>
                </div>
              </div>

              <div className="lab-footer-col">
                <h4 className="lab-footer-heading">ПІДПИСКА НА НОВИНИ</h4>
                <p className="lab-footer-text">
                  Дізнавайтеся першими про надходження ексклюзивних настілок, сезонні знижки та розіграші.
                </p>
                
                {subscribed ? (
                  <p className="lab-sub-success"><CheckCircleIcon size={16} className="sub-success-svg" /> Дякуємо! Ви успішно підписалися на розсилку.</p>
                ) : (
                  <form className="lab-newsletter-form" onSubmit={handleSubscribe}>
                    <input
                      type="email"
                      required
                      placeholder="Введіть ваш Email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="lab-newsletter-input"
                    />
                    <button type="submit" className="lab-newsletter-btn">
                      Підписатися
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="lab-footer-bottom">
              <div className="lab-footer-brand-line">
                <DiceIcon size={18} className="lab-footer-dice" />
                <span>Dice & Deck</span>
              </div>
              <p className="lab-footer-copy">
                © 2026 Dice & Deck — Інтернет-магазин настільних ігор. Всі права захищено.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}