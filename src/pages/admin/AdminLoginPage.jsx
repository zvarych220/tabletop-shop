import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import useAdmin from '../../hooks/useAdmin.js'
import {
  DiceIcon,
  SparklesIcon,
  HomeIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
} from '../../components/ui/Icons.jsx'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAdmin()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormError('')
  }

  function handleFillDemo() {
    setFormData({
      email: 'admin@tabletop.com',
      password: 'admin123',
    })
    setFormError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!formData.email || !formData.password) {
      setFormError('Будь ласка, заповніть усі поля форми')
      return
    }

    try {
      await login(formData.email, formData.password)
      navigate('/admin/products', { replace: true })
    } catch (err) {
      setFormError(err.message || 'Не вдалося увійти. Перевірте email та пароль.')
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Header with Dice & Deck Branding */}
        <div className="admin-login-header">
          <div className="admin-login-brand-icon">
            <DiceIcon size={32} />
          </div>
          <span className="admin-login-suite-tag">
            <SparklesIcon size={13} />
            Admin Suite v2.0
          </span>
          <h1 className="admin-login-title">Вхід для адміністраторів</h1>
          <p className="admin-login-subtitle">
            Введіть облікові дані для доступу до управління магазином Dice & Deck
          </p>
        </div>

        {/* Demo Credentials Quick Fill Banner */}
        <div className="admin-demo-box">
          <div className="admin-demo-info">
            <ShieldCheckIcon size={18} className="admin-demo-icon" />
            <div>
              <span className="admin-demo-label">Тестовий акаунт:</span>
              <span className="admin-demo-creds">
                admin@tabletop.com • admin123
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="admin-demo-fill-btn"
          >
            Заповнити
          </button>
        </div>

        {/* Error Alert */}
        {(formError || error) && (
          <div className="admin-login-error">
            <AlertTriangleIcon size={16} style={{ flexShrink: 0 }} />
            <span>{formError || error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="email" className="admin-form-label">
              Електронна пошта
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@tabletop.com"
              className="admin-form-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password" className="admin-form-label">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введіть пароль"
              className="admin-form-input"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="admin-login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="admin-btn-loader">Перевірка доступу...</span>
            ) : (
              'Увійти в панель'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="admin-login-footer">
          <Link to="/" className="admin-back-store-link">
            <HomeIcon size={16} />
            <span>Повернутися до вітрини магазину</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
