import { useMemo, useEffect } from 'react'
import useAdmin from '../../hooks/useAdmin.js'
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
  const { analytics, fetchAnalytics, isLoading } = useAdmin()

  // Fetch analytics on mount
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const stats = useMemo(() => {
    if (!analytics) {
      return {
        totalRevenue: 0,
        completedRevenue: 0,
        statusDistribution: { pending: 0, processing: 0, completed: 0, cancelled: 0 },
        topSellingProducts: [],
        averageOrderValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalOrders: 0,
        completedOrders: 0,
        completionRate: 0,
        topProducts: [],
        maxProductRevenue: 1,
        lowStockProducts: [],
        outOfStockProducts: [],
        monthlyRevenue: {},
      }
    }

    const totalOrders = Object.values(analytics.statusDistribution).reduce((sum, count) => sum + count, 0)
    const completedOrders = analytics.statusDistribution.completed || 0
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
    const maxProductRevenue = analytics.topSellingProducts[0]?.totalRevenue || 1

    return {
      ...analytics,
      totalOrders,
      completedOrders,
      completionRate,
      topProducts: analytics.topSellingProducts || [],
      maxProductRevenue,
      lowStockProducts: analytics.lowStockProducts || [],
      outOfStockProducts: analytics.outOfStockProducts || [],
      monthlyRevenue: analytics.monthlyRevenue || {},
    }
  }, [analytics])

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
              {stats.totalRevenue.toLocaleString('uk-UA')} ₴
            </div>
            <div className="admin-analytics-sublabel success">
              Доставлені замовлення: {stats.completedRevenue.toLocaleString('uk-UA')} ₴
            </div>
          </div>
        </div>

        <div className="admin-analytics-card">
          <div className="admin-analytics-icon-box blue">
            <PackageIcon size={26} />
          </div>
          <div className="admin-analytics-content">
            <span className="admin-analytics-label">Всього замовлень</span>
            <div className="admin-analytics-value">{stats.totalOrders}</div>
            <div className="admin-analytics-sublabel info">
              {stats.completedOrders} завершено ({stats.completionRate}% успішно)
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
              {Math.round(stats.averageOrderValue).toLocaleString('uk-UA')} ₴
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
              {stats.lowStockCount + stats.outOfStockCount}
            </div>
            <div className="admin-analytics-sublabel danger">
              {stats.lowStockCount} закінчуються • {stats.outOfStockCount} немає
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
            {stats.topProducts.length === 0 ? (
              <div className="admin-empty-state">
                <p>Немає даних про продажі</p>
              </div>
            ) : (
              stats.topProducts.map((product, index) => {
                const revenue = product.totalRevenue ?? product.revenue ?? 0
                const quantity = product.totalQuantity ?? product.quantity ?? 0
                const percentage = Math.round(
                  (revenue / stats.maxProductRevenue) * 100
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
                  <div key={product.gameId || index} className="admin-top-product-item">
                    <div className={`admin-top-product-rank ${rankClass}`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="admin-top-product-info">
                      <div className="admin-top-product-name-row">
                        <span className="admin-top-product-name">
                          {product.title}
                        </span>
                        <span className="admin-top-product-revenue">
                          {revenue.toLocaleString('uk-UA')} ₴
                        </span>
                      </div>

                      <div className="admin-top-product-stats-row">
                        <span className="admin-top-product-stats">
                          Продано: <strong>{quantity} шт</strong>
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
              })
            )}
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
            <span className="admin-chip">{stats.totalOrders} всього</span>
          </div>

          <div className="admin-status-distribution">
            {Object.entries(stats.statusDistribution || {}).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status] || {
                label: status,
                color: '#64748b',
                bg: '#f1f5f9',
              }
              const pct = stats.totalOrders
                ? Math.round((count / stats.totalOrders) * 100)
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
            {Object.entries(stats.monthlyRevenue || {}).map(([month, revenue]) => {
              // Format "2026-10" → "Жовтень 2026"
              const [year, mm] = month.split('-')
              const label = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' }).format(
                new Date(Number(year), Number(mm) - 1, 1)
              )
              const capitalLabel = label.charAt(0).toUpperCase() + label.slice(1)
              return (
                <div key={month} className="admin-monthly-item">
                  <div className="admin-monthly-meta">
                    <span className="admin-monthly-label">{capitalLabel}</span>
                    <span className="admin-monthly-sub">Замовлень на суму</span>
                  </div>
                  <div className="admin-monthly-value">
                    {revenue.toLocaleString('uk-UA')} ₴
                  </div>
                </div>
              )
            })}
            {(!stats.monthlyRevenue || Object.keys(stats.monthlyRevenue).length === 0) && (
              <div className="admin-empty-state">
                <p>Дані за поточний період оновлюються</p>
              </div>
            )}
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
              {(stats.lowStockProducts?.length || 0) + (stats.outOfStockProducts?.length || 0)} позицій
            </span>
          </div>

          <div className="admin-low-stock-list">
            {(stats.outOfStockProducts || []).map((product) => (
              <div key={product.id} className="admin-low-stock-item out-of-stock">
                <div className="admin-low-stock-info">
                  <span className="admin-low-stock-name">{product.title}</span>
                  <span className="admin-chip danger">Закінчився повністю</span>
                </div>
                <span className="admin-badge admin-badge-danger">0 шт</span>
              </div>
            ))}

            {(stats.lowStockProducts || []).map((product) => (
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

            {(!stats.lowStockProducts || stats.lowStockProducts.length === 0) &&
              (!stats.outOfStockProducts || stats.outOfStockProducts.length === 0) && (
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
