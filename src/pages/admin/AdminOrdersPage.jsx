import { useState, useMemo, useEffect } from 'react'
import { api } from '../../services/api.js'
import {
  EyeIcon,
  TrashIcon,
  SearchIcon,
  RotateCcwIcon,
  ClipboardListIcon,
  ClockIcon,
  TruckIcon,
  CoinsIcon,
  PackageIcon,
  UserIcon,
  MessageCircleIcon,
} from '../../components/ui/Icons.jsx'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Очікує обробки', color: 'warning' },
  { value: 'processing', label: 'В обробці', color: 'info' },
  { value: 'completed', label: 'Завершено', color: 'success' },
  { value: 'cancelled', label: 'Скасовано', color: 'danger' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setIsLoading(true)
    try {
      const data = await api.orders.getAll()
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      alert('Не вдалося завантажити замовлення')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      const order = orders.find(o => o.id === orderId)
      if (!order) return

      await api.orders.updateStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Не вдалося оновити статус замовлення')
    }
  }

  async function handleDelete(orderId) {
    if (confirm('Ви впевнені, що хочете видалити це замовлення?')) {
      try {
        await api.orders.delete(orderId)
        setOrders((prev) => prev.filter((order) => order.id !== orderId))
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null)
        }
      } catch (error) {
        console.error('Failed to delete order:', error)
        alert('Не вдалося видалити замовлення')
      }
    }
  }

  function getStatusBadge(status) {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status)
    return (
      <span className={`admin-badge admin-badge-${option?.color || 'secondary'}`}>
        <span className={`admin-badge-dot ${option?.color || 'secondary'}`} />
        {option?.label || status}
      </span>
    )
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Statistics
  const stats = useMemo(() => {
    const total = orders.length
    const pending = orders.filter((o) => o.status === 'pending').length
    const processing = orders.filter((o) => o.status === 'processing').length
    const completed = orders.filter((o) => o.status === 'completed').length
    const cancelled = orders.filter((o) => o.status === 'cancelled').length
    const totalRevenue = orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0)

    return { total, pending, processing, completed, cancelled, totalRevenue }
  }, [orders])

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const matchId = order.id?.toLowerCase().includes(q)
          const matchName = order.fullName?.toLowerCase().includes(q)
          const matchPhone = order.phone?.toLowerCase().includes(q)
          const matchCity = order.city?.toLowerCase().includes(q)
          const matchItem = order.orderedItems?.some((item) =>
            item.title?.toLowerCase().includes(q)
          )
          if (!matchId && !matchName && !matchPhone && !matchCity && !matchItem) {
            return false
          }
        }
        // Status filter tab
        if (statusFilter !== 'all' && order.status !== statusFilter) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
      })
  }, [orders, searchQuery, statusFilter, sortOrder])

  function resetFilters() {
    setSearchQuery('')
    setStatusFilter('all')
    setSortOrder('newest')
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || sortOrder !== 'newest'

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Управління замовленнями</h1>
          <p className="admin-page-subtitle">
            Моніторинг статусів замовлень, клієнтів та оплат
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap primary">
            <ClipboardListIcon size={22} />
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-label">Всього замовлень</span>
            <div className="admin-stat-value">{stats.total}</div>
            <span className="admin-stat-meta">За весь час</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap warning">
            <ClockIcon size={22} />
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-label">Очікують підтвердження</span>
            <div className="admin-stat-value">{stats.pending}</div>
            <span className="admin-stat-meta">Потребують дзвінка</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap info">
            <TruckIcon size={22} />
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-label">В процесі доставки</span>
            <div className="admin-stat-value">{stats.processing}</div>
            <span className="admin-stat-meta">Упаковано / Відправлено</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap success">
            <CoinsIcon size={22} />
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-label">Виручка завершених</span>
            <div className="admin-stat-value">
              {stats.totalRevenue.toLocaleString('uk-UA')} ₴
            </div>
            <span className="admin-stat-meta">
              {stats.completed} успішно доставлено
            </span>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="admin-filter-tabs-wrapper">
        <div className="admin-filter-tabs">
          <button
            type="button"
            className={`admin-filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Всі замовлення <span className="admin-tab-count">{stats.total}</span>
          </button>
          <button
            type="button"
            className={`admin-filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Очікують <span className="admin-tab-count warning">{stats.pending}</span>
          </button>
          <button
            type="button"
            className={`admin-filter-tab ${statusFilter === 'processing' ? 'active' : ''}`}
            onClick={() => setStatusFilter('processing')}
          >
            В обробці <span className="admin-tab-count info">{stats.processing}</span>
          </button>
          <button
            type="button"
            className={`admin-filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Завершено <span className="admin-tab-count success">{stats.completed}</span>
          </button>
          <button
            type="button"
            className={`admin-filter-tab ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Скасовано <span className="admin-tab-count danger">{stats.cancelled}</span>
          </button>
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <SearchIcon size={18} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Пошук за № замовлення, клієнтом, телефоном чи містом..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="admin-search-clear"
              aria-label="Очистити"
            >
              ×
            </button>
          )}
        </div>

        <div className="admin-filter-group">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="admin-select"
            aria-label="Сортувати за датою"
          >
            <option value="newest">Спершу найновіші</option>
            <option value="oldest">Спершу давніші</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="admin-btn-secondary admin-btn-reset"
              title="Скинути фільтри"
            >
              <RotateCcwIcon size={15} />
              <span>Скинути</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="admin-results-info">
        <span>
          Відображено замовлень: <strong>{filteredOrders.length}</strong> з{' '}
          {orders.length}
        </span>
      </div>

      {/* Orders Table */}
      <div className="admin-table-container">
        {filteredOrders.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <PackageIcon size={48} />
            </div>
            <h3 className="admin-empty-title">Замовлень не знайдено</h3>
            <p className="admin-empty-desc">
              Немає замовлень за обраними критеріями пошуку або фільтрами.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="admin-btn-primary"
              >
                Скинути фільтри
              </button>
            )}
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>№ Замовлення</th>
                  <th>Клієнт</th>
                  <th>Товари</th>
                  <th>Сума</th>
                  <th>Дата</th>
                  <th>Статус</th>
                  <th style={{ textAlign: 'right', width: '110px' }}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const itemsCount = order.orderedItems?.reduce(
                    (s, i) => s + (i.quantity || 1),
                    0
                  ) || 0

                  return (
                    <tr key={order.id} className="admin-table-row">
                      <td>
                        <span className="admin-order-id-badge">{order.id}</span>
                      </td>
                      <td>
                        <div className="admin-client-cell">
                          <span className="admin-client-name">{order.fullName}</span>
                          <span className="admin-client-phone">{order.phone}</span>
                          {order.city && (
                            <span className="admin-client-city">{order.city}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="admin-order-items-cell">
                          <div className="admin-order-items-preview">
                            {order.orderedItems?.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="admin-order-item-chip">
                                <span className="admin-order-item-title">
                                  {item.title}
                                </span>
                                <span className="admin-order-item-qty">
                                  ×{item.quantity}
                                </span>
                              </div>
                            ))}
                            {order.orderedItems?.length > 2 && (
                              <span className="admin-order-items-more">
                                + ще {order.orderedItems.length - 2} поз.
                              </span>
                            )}
                          </div>
                          <span className="admin-order-items-total-label">
                            Всього: {itemsCount} шт
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-price-cell">
                          <span className="admin-order-price-val">
                            {order.totalPrice?.toLocaleString('uk-UA')} ₴
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-order-date">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div className="admin-status-dropdown-wrap">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            className={`admin-status-select ${order.status}`}
                            aria-label="Змінити статус замовлення"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>
                        <div
                          className="admin-actions"
                          style={{ justifyContent: 'flex-end' }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="admin-btn-icon view"
                            title="Переглянути деталі замовлення"
                            aria-label="Переглянути"
                          >
                            <EyeIcon size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(order.id)}
                            className="admin-btn-icon danger"
                            title="Видалити замовлення"
                            aria-label="Видалити"
                          >
                            <TrashIcon size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <div>
                <div className="admin-modal-title-row">
                  <h2 className="admin-modal-title">
                    Замовлення #{selectedOrder.id}
                  </h2>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="admin-modal-subtitle">
                  Створено: {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="admin-modal-close"
                aria-label="Закрити"
              >
                ×
              </button>
            </div>

            <div className="admin-modal-content">
              {/* Quick Status Bar inside Modal */}
              <div className="admin-modal-status-bar">
                <span className="admin-modal-status-label">Статус замовлення:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value)
                  }
                  className={`admin-status-select ${selectedOrder.status}`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client & Delivery Info Grid */}
              <div className="admin-detail-cards-grid">
                <div className="admin-detail-card">
                  <h4 className="admin-detail-card-title">
                    <UserIcon size={18} style={{ marginRight: '0.5rem' }} />
                    Дані клієнта
                  </h4>
                  <div className="admin-detail-list">
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">ПІБ:</span>
                      <span className="admin-detail-value font-semibold">
                        {selectedOrder.fullName}
                      </span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Телефон:</span>
                      <a
                        href={`tel:${selectedOrder.phone}`}
                        className="admin-detail-link"
                      >
                        {selectedOrder.phone}
                      </a>
                    </div>
                    {selectedOrder.email && (
                      <div className="admin-detail-row">
                        <span className="admin-detail-label">Email:</span>
                        <a
                          href={`mailto:${selectedOrder.email}`}
                          className="admin-detail-link"
                        >
                          {selectedOrder.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-detail-card">
                  <h4 className="admin-detail-card-title">
                    <TruckIcon size={18} style={{ marginRight: '0.5rem' }} />
                    Доставка та оплата
                  </h4>
                  <div className="admin-detail-list">
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Служба доставки:</span>
                      <span className="admin-detail-value">
                        {selectedOrder.deliveryService === 'nova_poshta'
                          ? 'Нова Пошта (відділення)'
                          : selectedOrder.deliveryService === 'ukrposhta'
                            ? 'Укрпошта'
                            : 'Курʼєрська доставка'}
                      </span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Населений пункт:</span>
                      <span className="admin-detail-value">
                        {selectedOrder.city}
                      </span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Відділення / Адреса:</span>
                      <span className="admin-detail-value">
                        {selectedOrder.branch || '—'}
                      </span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Спосіб оплати:</span>
                      <span className="admin-detail-value">
                        {selectedOrder.paymentMethod === 'cash_on_delivery'
                          ? 'Накладений платіж при отриманні'
                          : 'Онлайн оплата (LiqPay / Card)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="admin-order-modal-items-section">
                <h4 className="admin-detail-card-title">
                  <PackageIcon size={18} style={{ marginRight: '0.5rem' }} />
                  Замовлені позиції
                </h4>
                <div className="admin-modal-items-table">
                  {selectedOrder.orderedItems?.map((item, idx) => (
                    <div key={idx} className="admin-modal-item-row">
                      <div className="admin-modal-item-info">
                        <span className="admin-modal-item-name">{item.title}</span>
                        {item.category && (
                          <span className="admin-chip">{item.category}</span>
                        )}
                      </div>
                      <div className="admin-modal-item-qty">
                        {item.quantity} × {item.price?.toLocaleString('uk-UA')} ₴
                      </div>
                      <div className="admin-modal-item-subtotal">
                        {((item.price || 0) * (item.quantity || 1)).toLocaleString(
                          'uk-UA'
                        )}{' '}
                        ₴
                      </div>
                    </div>
                  ))}
                </div>

                <div className="admin-modal-order-summary">
                  <div className="admin-modal-summary-line total">
                    <span>Разом до сплати:</span>
                    <span className="admin-modal-total-value">
                      {selectedOrder.totalPrice?.toLocaleString('uk-UA')} ₴
                    </span>
                  </div>
                </div>
              </div>

              {/* Comment if any */}
              {selectedOrder.comment && (
                <div className="admin-modal-comment-box">
                  <span className="admin-detail-label">
                    <MessageCircleIcon size={16} style={{ marginRight: '0.5rem' }} />
                    Коментар покупця:
                  </span>
                  <p className="admin-comment-text">{selectedOrder.comment}</p>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="admin-btn-secondary"
              >
                Закрити вікно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
