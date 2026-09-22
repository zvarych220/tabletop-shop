import AppLayout from './components/layout/AppLayout.jsx'
import BoardGameSelectionProvider from './providers/BoardGameSelectionProvider.jsx'
import CatalogContainer from './pages/CatalogContainer.jsx'
import OrderContainer from './pages/OrderContainer.jsx'
import { boardGames } from './data/boardGames.js'

const navLinks = [
  { href: '#about', label: 'Про магазин' },
  { href: '#catalog', label: 'Каталог' },
  { href: '#order', label: 'Замовлення' },
]

export default function App() {
  return (
    <AppLayout title="Dice & Deck" links={navLinks}>
      <BoardGameSelectionProvider items={boardGames}>
        <CatalogContainer items={boardGames} />
        <OrderContainer />
      </BoardGameSelectionProvider>
    </AppLayout>
  )
}