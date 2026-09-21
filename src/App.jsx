import AppLayout from './components/layout/AppLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import OrderPage from './pages/OrderPage.jsx'
import { boardGames } from './data/boardGames.js'

const navLinks = [
  { href: '#about', label: 'Про магазин' },
  { href: '#catalog', label: 'Каталог' },
  { href: '#order', label: 'Замовлення' },
]

export default function App() {
  // Фіксований приклад для демонстрації макета другої сторінки (Л 1.2)
  const exampleGame = boardGames.find((g) => g.id === 'game-001')

  return (
    <AppLayout title="Dice & Deck" links={navLinks}>
      <HomePage />
      <OrderPage selectedGame={exampleGame} />
    </AppLayout>
  )
}