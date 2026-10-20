import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import { api } from '../../services/api.js'
import { useProducts } from '../../hooks/useProducts.js'
import {
  MessageSquareIcon,
  CheckIcon,
  CloseIcon,
  TrashIcon,
  SearchIcon,
  RotateCcwIcon,
  StarFilledIcon,
  UserCircleIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from '../../components/ui/Icons.jsx'

export default function AdminReviewsPage() {
  const { products } = useProducts()
  const [reviews, setReviews] = useState([])
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [notification, setNotification] = useState(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'pending' | 'approved' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('')
  const [productFilter, setProductFilter] = useState('all')

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (searchQuery.trim()) params.search = searchQuery.trim()
      if (productFilter !== 'all') params.productId = productFilter

      const res = await api.reviews.getAll(params)
      setReviews(Array.isArray(res) ? res : (res.data || []))
      if (res.counts) {
        setCounts(res.counts)
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
      showNotification('error', 'Не вдалося завантажити відгуки')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, searchQuery, productFilter])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  function showNotification(type, message) {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  async function handleStatusChange(reviewId, newStatus) {
    setUpdatingId(reviewId)
    try {
      await api.reviews.updateStatus(reviewId, newStatus)
      showNotification(
        'success',
        newStatus === 'approved'
          ? 'Відгук схвалено та опубліковано на сторінці гри'
          : 'Статус відгуку змінено на «Відхилено»'
      )
      // Refetch to get updated list and accurate counts
      await fetchReviews()
    } catch (err) {
      console.error('Failed to update review status:', err)
      showNotification('error', 'Помилка під час зміни статусу відгуку')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleDelete(reviewId) {
    if (!window.confirm('Ви впевнені, що хочете остаточно видалити цей відгук?')) {
      return
    }

    setUpdatingId(reviewId)
    try {
      await api.reviews.delete(reviewId)
      showNotification('success', 'Відгук видалено')
      await fetchReviews()
    } catch (err) {
      console.error('Failed to delete review:', err)
      showNotification('error', 'Помилка під час видалення відгуку')
    } finally {
      setUpdatingId(null)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || productFilter !== 'all'

  function resetFilters() {
    setSearchQuery('')
    setStatusFilter('all')
    setProductFilter('all')
  }

  return (
    <div className="admin-page">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`admin-toast ${notification.type === 'success' ? 'success' : 'error'}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
            color: '#fff',
            fontWeight: 600,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            animation: 'slideIn 0.25s ease-out',
          }}
        >
          {notification.type === 'success' ? (
            <CheckCircleIcon size={20} />
          ) : (
            <AlertTriangleIcon size={20} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <div className="admin-page-title-wrap">
            <h1 className="admin-page-title">Модерація відгуків</h1>
            <span className="admin-page-subtitle">
              Перевіряйте та затверджуйте відгуки клієнтів перед їхньою публікацією
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div
          className={`admin-stat-card ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-stat-icon purple">
            <MessageSquareIcon size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-val">{counts.total}</span>
            <span className="admin-stat-label">Всього відгуків</span>
          </div>
        </div>

        <div
          className={`admin-stat-card ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-stat-icon warning">
            <AlertTriangleIcon size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-val" style={{ color: counts.pending > 0 ? '#d97706' : undefined }}>
              {counts.pending}
            </span>
            <span className="admin-stat-label">Очікують перевірки</span>
          </div>
        </div>

        <div
          className={`admin-stat-card ${statusFilter === 'approved' ? 'active' : ''}`}
          onClick={() => setStatusFilter('approved')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-stat-icon success">
            <CheckCircleIcon size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-val" style={{ color: '#059669' }}>
              {counts.approved}
            </span>
            <span className="admin-stat-label">Схвалені</span>
          </div>
        </div>

        <div
          className={`admin-stat-card ${statusFilter === 'rejected' ? 'active' : ''}`}
          onClick={() => setStatusFilter('rejected')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-stat-icon danger">
            <CloseIcon size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-val" style={{ color: '#dc2626' }}>
              {counts.rejected}
            </span>
            <span className="admin-stat-label">Відхилені</span>
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
            Усі відгуки <span className="admin-tab-count">{counts.total}</span>
          </button>
          <button
            type="button"
            className={`admin-filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Очікують модерації{' '}
            <span className={`admin-tab-count ${counts.pending > 0 ? 'warning' : ''}`}>
              {counts.pending}
            </span>
          </button>
          <button
            type="button"
            className={`admin-filter-tab ${statusFilter === 'approved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('approved')}
          >
            Схвалені <span className="admin-tab-count success">{counts.approved}</span>
          </button>
          <button
            type="button"
            className={`admin-filter-tab ${statusFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => setStatusFilter('rejected')}
          >
            Відхилені <span className="admin-tab-count danger">{counts.rejected}</span>
          </button>
        </div>
      </div>

      {/* Search and Product Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <SearchIcon size={18} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Пошук за автором, текстом чи назвою гри..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="admin-search-clear"
              aria-label="Очистити пошук"
            >
              ×
            </button>
          )}
        </div>

        <div className="admin-filter-group">
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="admin-select"
            aria-label="Фільтр за товаром"
          >
            <option value="all">Усі настільні ігри</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
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
          Відображено відгуків: <strong>{reviews.length}</strong> з {counts.total}
        </span>
      </div>

      {/* Table Container */}
      <div className="admin-table-container">
        {isLoading ? (
          <div className="admin-loading-state" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <RotateCcwIcon size={24} className="spinning" />
            <p style={{ marginTop: '0.75rem' }}>Завантаження списку відгуків...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="admin-empty-state" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
            <MessageSquareIcon size={44} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: '0.5rem' }}>
              Відгуків не знайдено
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              {statusFilter === 'pending'
                ? 'Немає нових відгуків, що очікують на модерацію. Усі заявки опрацьовано!'
                : 'За вибраними критеріями пошуку або фільтрів відгуків не знайдено.'}
            </p>
            {hasActiveFilters && (
              <button type="button" onClick={resetFilters} className="admin-btn-primary">
                Скинути фільтри
              </button>
            )}
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '220px' }}>Товар</th>
                  <th style={{ width: '160px' }}>Автор</th>
                  <th style={{ width: '120px' }}>Оцінка</th>
                  <th>Відгук</th>
                  <th style={{ width: '140px' }}>Дата</th>
                  <th style={{ width: '120px' }}>Статус</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => {
                  const isUpdating = updatingId === rev.id

                  return (
                    <tr key={rev.id} className="admin-table-row" style={isUpdating ? { opacity: 0.6 } : undefined}>
                      {/* Product */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {rev.productImage ? (
                            <img
                              src={rev.productImage}
                              alt={rev.productTitle || ''}
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '6px',
                                background: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94a3b8',
                                flexShrink: 0,
                              }}
                            >
                              🎲
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <Link
                              to={`/games/${rev.productId}`}
                              target="_blank"
                              style={{
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                color: '#0f172a',
                                textDecoration: 'none',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '160px',
                              }}
                              title={rev.productTitle || rev.productId}
                            >
                              {rev.productTitle || rev.productId}
                            </Link>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              ID: {rev.productId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <UserCircleIcon size={20} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                color: '#1e293b',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {rev.authorName}
                            </div>
                            {rev.userId && (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: '#eff6ff',
                                  color: '#2563eb',
                                  fontWeight: 500,
                                }}
                              >
                                Клієнт
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarFilledIcon
                              key={star}
                              size={14}
                              style={{
                                color: star <= rev.rating ? '#f59e0b' : '#cbd5e1',
                              }}
                            />
                          ))}
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, marginLeft: '4px', color: '#475569' }}>
                            {rev.rating}.0
                          </span>
                        </div>
                      </td>

                      {/* Comment */}
                      <td>
                        <div
                          style={{
                            fontSize: '0.88rem',
                            lineHeight: 1.45,
                            color: '#334155',
                            maxHeight: '4.4em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {rev.comment}
                        </div>
                      </td>

                      {/* Date */}
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {formatDate(rev.createdAt)}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        {rev.status === 'pending' && (
                          <span className="admin-chip warning">
                            <span className="admin-chip-dot" />
                            Очікує
                          </span>
                        )}
                        {rev.status === 'approved' && (
                          <span className="admin-chip success">
                            <span className="admin-chip-dot" />
                            Схвалено
                          </span>
                        )}
                        {rev.status === 'rejected' && (
                          <span className="admin-chip danger">
                            <span className="admin-chip-dot" />
                            Відхилено
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="admin-actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                          {rev.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(rev.id, 'approved')}
                              disabled={isUpdating}
                              className="admin-btn-icon success"
                              title="Схвалити та опублікувати"
                              aria-label="Схвалити"
                              style={{ color: '#16a34a' }}
                            >
                              <CheckIcon size={16} />
                            </button>
                          )}

                          {rev.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(rev.id, 'rejected')}
                              disabled={isUpdating}
                              className="admin-btn-icon warning"
                              title="Відхилити відгук"
                              aria-label="Відхилити"
                              style={{ color: '#d97706' }}
                            >
                              <CloseIcon size={16} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(rev.id)}
                            disabled={isUpdating}
                            className="admin-btn-icon danger"
                            title="Видалити назавжди"
                            aria-label="Видалити"
                          >
                            <TrashIcon size={16} />
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
    </div>
  )
}
