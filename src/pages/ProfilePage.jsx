import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router'
import useAuth from '../hooks/useAuth.js'
import useOrders from '../hooks/useOrders.js'

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile, isLoading: authLoading } = useAuth()
  const { orders } = useOrders()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  })
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
      })
    }
  }, [user])

  if (!isAuthenticated && !authLoading) {
    return <Navigate to="/login" state={{ from: { pathname: '/profile' } }} replace />
  }

  if (!user) {
    return null
  }

  const userOrders = orders.filter((order) => order.userId === user.id)

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setSaveError('')
    setSaveSuccess(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaveError('')
    setSaveSuccess(false)

    if (!formData.name.trim()) {
      setSaveError('Ім\'я не може бути порожнім')
      return
    }

    try {
      await updateProfile(formData)
      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err.message || 'Не вдалося оновити профіль. Спробуйте ще раз.')
    }
  }

  function handleCancel() {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
    })
    setIsEditing(false)
    setSaveError('')
    setSaveSuccess(false)
  }

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <div className="profile-header-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <div className="profile-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="profile-section-title" style={{ margin: 0 }}>Особисті дані</h2>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              Редагувати
            </button>
          )}
        </div>

        {saveSuccess && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--color-success-light)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success-text)',
            fontSize: '0.9rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            ✓ Профіль успішно оновлено
          </div>
        )}

        {saveError && (
          <div className="auth-error-message" style={{ marginBottom: '1.25rem' }}>
            ⚠️ {saveError}
          </div>
        )}

        <form className="profile-form" onSubmit={handleSave}>
          <div className="profile-form-group">
            <label htmlFor="name" className="profile-form-label">
              Ім'я
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="profile-form-input"
              disabled={!isEditing}
              required
            />
          </div>

          <div className="profile-form-row">
            <div className="profile-form-group">
              <label htmlFor="email" className="profile-form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={user.email}
                className="profile-form-input"
                disabled
                style={{ background: 'var(--color-surface-subtle)', cursor: 'not-allowed' }}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="phone" className="profile-form-label">
                Телефон
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+380501234567"
                className="profile-form-input"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="profile-form-group">
            <label htmlFor="address" className="profile-form-label">
              Адреса доставки
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="м. Київ, вул. Хрещатик, 1"
              className="profile-form-input"
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="profile-form-actions">
              <button type="submit" className="profile-save-btn">
                Зберегти зміни
              </button>
              <button type="button" onClick={handleCancel} className="profile-cancel-btn">
                Скасувати
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">Історія замовлень</h2>
        {userOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--color-text-muted)',
          }}>
            <p style={{ margin: 0, marginBottom: '1rem' }}>
              У вас ще немає замовлень
            </p>
            <Link
              to="/games"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                background: 'var(--color-primary)',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              Перейти до каталогу
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {userOrders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-title)', marginBottom: '0.25rem' }}>
                    Замовлення #{order.id}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div style={{
                  padding: '0.375rem 0.75rem',
                  background: order.status === 'completed' ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                  color: order.status === 'completed' ? 'var(--color-success-text)' : 'var(--color-warning-text)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}>
                  {order.status === 'pending' && 'В обробці'}
                  {order.status === 'processing' && 'Обробляється'}
                  {order.status === 'completed' && 'Виконано'}
                  {order.status === 'cancelled' && 'Скасовано'}
                </div>
              </Link>
            ))}
            {userOrders.length > 5 && (
              <Link
                to="/orders"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '0.75rem',
                  color: 'var(--color-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Переглянути всі замовлення →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
