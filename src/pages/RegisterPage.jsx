import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import useAuth from '../hooks/useAuth.js'

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, isLoading, error } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  })
  const [formError, setFormError] = useState('')

  const from = location.state?.from?.pathname || '/'

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Ім\'я, email та пароль є обов\'язковими полями')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Паролі не співпадають')
      return
    }

    if (formData.password.length < 6) {
      setFormError('Пароль повинен містити мінімум 6 символів')
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
      })
      navigate(from, { replace: true })
    } catch (err) {
      setFormError(err.message || 'Не вдалося зареєструватися. Спробуйте ще раз.')
    }
  }

  return (
    <div className="auth-page-container">
      <div className="auth-form-card">
        <div className="auth-form-header">
          <h1 className="auth-form-title">Створення акаунту</h1>
          <p className="auth-form-subtitle">
            Зареєструйтеся, щоб мати доступ до всіх можливостей магазину
          </p>
        </div>

        {(formError || error) && (
          <div className="auth-error-message">
            ⚠️ {formError || error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="name" className="auth-form-label">
              Ім'я *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Тарас Шевченко"
              className="auth-form-input"
              autoComplete="name"
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="email" className="auth-form-label">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="auth-form-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password" className="auth-form-label">
              Пароль *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Мінімум 6 символів"
              className="auth-form-input"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="confirmPassword" className="auth-form-label">
              Підтвердження паролю *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Повторіть пароль"
              className="auth-form-input"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="phone" className="auth-form-label">
              Телефон
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+380501234567"
              className="auth-form-input"
              autoComplete="tel"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="address" className="auth-form-label">
              Адреса доставки
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="м. Київ, вул. Хрещатик, 1"
              className="auth-form-input"
              autoComplete="street-address"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
          </button>
        </form>

        <div className="auth-form-footer">
          Вже є акаунт?{' '}
          <Link to="/login" state={{ from: location.state?.from }} className="auth-link">
            Увійти
          </Link>
        </div>
      </div>
    </div>
  )
}
