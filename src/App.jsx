import HomePage from './pages/HomePage.jsx'

export default function App() {
  return (
    <div className="app-layout">
      <header className="site-header">
        <div className="logo-box">
          <span className="logo-icon"></span>
          <span className="logo-text">Dice & Deck</span>
        </div>
        <nav className="site-nav">
          <a href="#about">Про магазин</a>
          <a href="#catalog">Каталог</a>
        </nav>
      </header>

      <HomePage />

      <footer className="site-footer">
        <p>© 2026 Dice & Deck. Навчальний проєкт на ReactJS (Лабораторна 1.1).</p>
      </footer>
    </div>
  )
}