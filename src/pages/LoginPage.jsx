import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import useAuth from '../hooks/useAuth.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    if (!formData.email || !formData.password) {
      setFormError('Заповніть усі поля форми')
      return
    }

    try {
      await login(formData.email, formData.password)
      navigate(from, { replace: true })
    } catch (err) {
      setFormError(err.message || 'Не вдалося увійти. Спробуйте ще раз.')
    }
  }

  return (
    <div className="auth-page-container">
      <div className="auth-form-card">
        <div className="auth-form-header">
          <h1 className="auth-form-title">Вхід до акаунту</h1>
          <p className="auth-form-subtitle">
            Увійдіть, щоб отримати доступ до історії замовлень та списку обраного
          </p>
        </div>

        {(formError || error) && (
          <div className="auth-error-message">
            ⚠️ {formError || error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-form-label">
              Email
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
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введіть ваш пароль"
              className="auth-form-input"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        <div className="auth-form-footer">
          Ще не маєте акаунту?{' '}
          <Link to="/register" state={{ from: location.state?.from }} className="auth-link">
            Зареєструватися
          </Link>
        </div>
      </div>
    </div>
  )
}
