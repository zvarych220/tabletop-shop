import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import AuthProvider from './providers/AuthProvider.jsx'
import AdminProvider from './providers/AdminProvider.jsx'
import CartProvider from './providers/CartProvider.jsx'
import FavoritesProvider from './providers/FavoritesProvider.jsx'
import OrdersProvider from './providers/OrdersProvider.jsx'
import BoardGameSelectionProvider from './providers/BoardGameSelectionProvider.jsx'
import App from './App.jsx'
import './index.css'
import './admin.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <CartProvider>
            <FavoritesProvider>
              <OrdersProvider>
                <BoardGameSelectionProvider>
                  <App />
                </BoardGameSelectionProvider>
              </OrdersProvider>
            </FavoritesProvider>
          </CartProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)