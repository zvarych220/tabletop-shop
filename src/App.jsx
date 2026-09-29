import { Route, Routes } from 'react-router'
import AppLayout from './components/layout/AppLayout.jsx'
import OrdersLayout from './components/layout/OrdersLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import CatalogContainer from './pages/CatalogContainer.jsx'
import BoardGameDetailsPage from './pages/BoardGameDetailsPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import OrderCreatePage from './pages/OrderCreatePage.jsx'
import OrderDetailsPage from './pages/OrderDetailsPage.jsx'
import OrderEditPage from './pages/OrderEditPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { boardGames } from './data/boardGames.js'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout items={boardGames} />}>
        {/* Головна сторінка */}
        <Route index element={<HomePage />} />

        {/* Каталог і деталі гри */}
        <Route path="games">
          <Route index element={<CatalogContainer items={boardGames} />} />
          <Route path=":gameId" element={<BoardGameDetailsPage items={boardGames} />} />
        </Route>

        {/* Вкладені маршрути замовлень */}
        <Route path="orders" element={<OrdersLayout />}>
          <Route index element={<OrdersPage items={boardGames} />} />
          <Route path="new" element={<OrderCreatePage items={boardGames} />} />
          <Route path=":orderId" element={<OrderDetailsPage items={boardGames} />} />
          <Route path=":orderId/edit" element={<OrderEditPage items={boardGames} />} />
        </Route>

        {/* Невідомий маршрут (404) */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}