import { Route, Routes } from 'react-router'
import AppLayout from './components/layout/AppLayout.jsx'
import OrdersLayout from './components/layout/OrdersLayout.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import CatalogContainer from './pages/CatalogContainer.jsx'
import BoardGameDetailsPage from './pages/BoardGameDetailsPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import OrderCreatePage from './pages/OrderCreatePage.jsx'
import OrderDetailsPage from './pages/OrderDetailsPage.jsx'
import OrderEditPage from './pages/OrderEditPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx'
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx'
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { boardGames } from './data/boardGames.js'

export default function App() {
  return (
    <Routes>
      {/* Адмін логін */}
      <Route path="adminLogin" element={<AdminLoginPage />} />

      {/* Адмін панель */}
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminProductsPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
      </Route>

      {/* Основний сайт */}
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

        {/* Аутентифікація */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Профіль користувача */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Список обраного */}
        <Route path="favorites" element={<FavoritesPage />} />

        {/* Невідомий маршрут (404) */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}