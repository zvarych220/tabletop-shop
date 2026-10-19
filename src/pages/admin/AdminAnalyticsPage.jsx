import { useMemo, useState, useEffect } from 'react'
import { orders as initialOrders } from '../../data/orders.js'
import { useProducts } from '../../hooks/useProducts.js'
import {
  CoinsIcon,
  PackageIcon,
  BarChartIcon,
  AlertTriangleIcon,
  TrophyIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
} from '../../components/ui/Icons.jsx'

const STATUS_CONFIG = {
  pending: { label: 'Очікує обробки', color: '#f59e0b', bg: '#fef3c7' },
  processing: { label: 'В обробці', color: '#3b82f6', bg: '#eff6ff' },
  completed: { label: 'Завершено', color: '#10b981', bg: '#ecfdf5' },
  cancelled: { label: 'Скасовано', color: '#ef4444', bg: '#fee2e2' },
}

export default function AdminAnalyticsPage() {
  const { products } = useProducts()
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_orders')
      return saved ? JSON.parse(saved) : initialOrders
    } catch {
      return initialOrders
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('admin_orders', JSON.stringify(orders))
    } catch (error) {
      console.error('Failed to save orders to localStorage:', error)
    }
  }, [orders])

  const analytics = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    )
    const completedOrders = orders.filter((o) => o.status === 'completed')
    const completedRevenue = completedOrders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    )

    const productSales = {}
    orders.forEach((order) => {
      order.orderedItems?.forEach((item) => {
        if (!productSales[item.gameId]) {
          productSales[item.gameId] = {
            gameId: item.gameId,
            title: item.title,
            quantity: 0,
            revenue: 0,
          }
        }
        productSales[item.gameId].quantity += item.quantity || 1
        productSales[item.gameId].revenue +=
          (item.price || 0) * (item.quantity || 1)
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const maxProductRevenue = topProducts[0]?.revenue || 1

    const statusDistribution = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})

    const averageOrderValue =
      orders.length > 0 ? totalRevenue / orders.length : 0

    const lowStockProducts = products.filter(
      (game) => game.stockQuantity > 0 && game.stockQuantity <= 5
    )

    const outOfStockProducts = products.filter(
      (game) => game.stockQuantity === 0
    )

    const monthlyRevenue = orders.reduce((acc, order) => {
      const month = new Date(order.createdAt).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
      })
      acc[month] = (acc[month] || 0) + (order.totalPrice || 0)
      return acc
    }, {})

    const completionRate =
      orders.length > 0
        ? Math.round((completedOrders.length / orders.length) * 100)
        : 0

    return {
      totalRevenue,
      completedRevenue,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      completionRate,
      topProducts,
      maxProductRevenue,
      statusDistribution,
      averageOrderValue,
      lowStockProducts,
      outOfStockProducts,
      monthlyRevenue,
    }
  }, [orders, products])

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Аналітика та фінансові звіти</h1>
          <p className="admin-page-subtitle">
            Ключові показники ефективності магазину, статистика продажів та залишки
          </p>
        </div>
        <div className="admin-header-actions">
          <span className="admin-analytics-period-badge">
            <ClockIcon size={14} />
            За весь період
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-analytics-grid">
        <div className="admin-analytics-card">
          <div className="admin-analytics-icon-box emerald">
            <CoinsIcon size={26} />
          </div>
          <div className="admin-analytics-content">
            <span className="admin-analytics-label">Загальний дохід</span>
            <div className="admin-analytics-value">
              {analytics.totalRevenue.toLocaleString('uk-UA')} ₴
            </div>
            <div className="admin-analytics-sublabel success">
              Доставлені замовлення: {analytics.completedRevenue.toLocaleString('uk-UA')} ₴
            </div>
          </div>
        </div>

        <div className="admin-analytics-card">
          <div className="admin-analytics-icon-box blue">
            <PackageIcon size={26} />
          </div>
          <div className="admin-analytics-content">
            <span className="admin-analytics-label">Всього замовлень</span>
            <div className="admin-analytics-value">{analytics.totalOrders}</div>
            <div className="admin-analytics-sublabel info">
              {analytics.completedOrders} завершено ({analytics.completionRate}% успішно)
            </div>
          </div>
        </div>

        <div className="admin-analytics-card">
          <div className="admin-analytics-icon-box amber">
            <BarChartIcon size={26} />
          </div>
          <div className="admin-analytics-content">
            <span className="admin-analytics-label">Середній чек</span>
            <div className="admin-analytics-value">
              {Math.round(analytics.averageOrderValue).toLocaleString('uk-UA')} ₴
            </div>
            <div className="admin-analytics-sublabel">
              На одне оформлене замовлення
            </div>
          </div>
        </div>

        <div className="admin-analytics-card">
          <div className="admin-analytics-icon-box rose">
            <AlertTriangleIcon size={26} />
          </div>
          <div className="admin-analytics-content">
            <span className="admin-analytics-label">Складські ризики</span>
            <div className="admin-analytics-value">
              {analytics.lowStockProducts.length + analytics.outOfStockProducts.length}
            </div>
            <div className="admin-analytics-sublabel danger">
              {analytics.lowStockProducts.length} закінчуються • {analytics.outOfStockProducts.length} немає
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Sections */}
      <div className="admin-section-grid">
        {/* Top 5 Products */}
        <div className="admin-section-card">
          <div className="admin-section-header-row">
            <div className="admin-section-title-wrap">
              <span className="admin-section-icon-badge">
                <TrophyIcon size={18} />
              </span>
              <h2 className="admin-section-title">Топ-5 ігор за виручкою</h2>
            </div>
            <span className="admin-chip">Лідер продажів</span>
          </div>

          <div className="admin-top-products">
            {analytics.topProducts.map((product, index) => {
              const percentage = Math.round(
                (product.revenue / analytics.maxProductRevenue) * 100
              )
              const rankClass =
                index === 0
                  ? 'gold'
                  : index === 1
                    ? 'silver'
                    : index === 2
                      ? 'bronze'
                      : 'standard'

              return (
                <div key={product.gameId} className="admin-top-product-item">
                  <div className={`admin-top-product-rank ${rankClass}`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div className="admin-top-product-info">
                    <div className="admin-top-product-name-row">
                      <span className="admin-top-product-name">
                        {product.title}
                      </span>
                      <span className="admin-top-product-revenue">
                        {product.revenue.toLocaleString('uk-UA')} ₴
                      </span>
                    </div>

                    <div className="admin-top-product-stats-row">
                      <span className="admin-top-product-stats">
                        Продано: <strong>{product.quantity} шт</strong>
                      </span>
                      <span className="admin-top-product-pct">{percentage}% від лідера</span>
                    </div>

                    <div className="admin-progress-bar-container">
                      <div
                        className="admin-progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="admin-section-card">
          <div className="admin-section-header-row">
            <div className="admin-section-title-wrap">
              <span className="admin-section-icon-badge">
                <TruckIcon size={18} />
              </span>
              <h2 className="admin-section-title">Розподіл замовлень за статусами</h2>
            </div>
            <span className="admin-chip">{analytics.totalOrders} всього</span>
          </div>

          <div className="admin-status-distribution">
            {Object.entries(analytics.statusDistribution).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status] || {
                label: status,
                color: '#64748b',
                bg: '#f1f5f9',
              }
              const pct = analytics.totalOrders
                ? Math.round((count / analytics.totalOrders) * 100)
                : 0

              return (
                <div key={status} className="admin-status-item">
                  <div className="admin-status-label-wrap">
                    <span
                      className="admin-status-item-dot"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <span className="admin-status-label">{cfg.label}</span>
                  </div>

                  <div className="admin-status-bar-container">
                    <div
                      className="admin-status-bar"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: cfg.color,
                      }}
                    />
                  </div>

                  <div className="admin-status-stat">
                    <span className="admin-status-count">{count}</span>
                    <span className="admin-status-pct">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Monthly Revenue & Stock Health */}
      <div className="admin-section-grid">
        {/* Monthly Revenue */}
        <div className="admin-section-card">
          <div className="admin-section-header-row">
            <div className="admin-section-title-wrap">
              <span className="admin-section-icon-badge">
                <CoinsIcon size={18} />
              </span>
              <h2 className="admin-section-title">Виручка за періодами</h2>
            </div>
          </div>

          <div className="admin-monthly-revenue">
            {Object.entries(analytics.monthlyRevenue).map(([month, revenue]) => (
              <div key={month} className="admin-monthly-item">
                <div className="admin-monthly-meta">
                  <span className="admin-monthly-label">{month}</span>
                  <span className="admin-monthly-sub">Замовлень на суму</span>
                </div>
                <div className="admin-monthly-value">
                  {revenue.toLocaleString('uk-UA')} ₴
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Health */}
        <div className="admin-section-card">
          <div className="admin-section-header-row">
            <div className="admin-section-title-wrap">
              <span className="admin-section-icon-badge">
                <AlertTriangleIcon size={18} />
              </span>
              <h2 className="admin-section-title">Потребують поповнення складу</h2>
            </div>
            <span className="admin-badge admin-badge-warning">
              {analytics.lowStockProducts.length + analytics.outOfStockProducts.length} позицій
            </span>
          </div>

          <div className="admin-low-stock-list">
            {analytics.outOfStockProducts.map((product) => (
              <div key={product.id} className="admin-low-stock-item out-of-stock">
                <div className="admin-low-stock-info">
                  <span className="admin-low-stock-name">{product.title}</span>
                  <span className="admin-chip danger">Закінчився повністю</span>
                </div>
                <span className="admin-badge admin-badge-danger">0 шт</span>
              </div>
            ))}

            {analytics.lowStockProducts.map((product) => (
              <div key={product.id} className="admin-low-stock-item">
                <div className="admin-low-stock-info">
                  <span className="admin-low-stock-name">{product.title}</span>
                  <span className="admin-chip warning">
                    Критичний залишок
                  </span>
                </div>
                <span className="admin-badge admin-badge-warning">
                  {product.stockQuantity} шт
                </span>
              </div>
            ))}

            {analytics.lowStockProducts.length === 0 &&
              analytics.outOfStockProducts.length === 0 && (
                <div className="admin-empty-state">
                  <CheckCircleIcon size={24} style={{ color: '#10b981' }} />
                  <p>Всі товари в достатній кількості на складі!</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
