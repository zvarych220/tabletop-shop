import { useState, useEffect } from 'react'
import { api } from '../../services/api.js'
import {
  SendIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '../../components/ui/Icons.jsx'

export default function AdminTelegramPage() {
  const [settings, setSettings] = useState({
    botToken: '',
    adminChatId: '',
    botUsername: '',
    notificationsEnabled: true,
    hasToken: false,
    maskedToken: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [testChatId, setTestChatId] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [notification, setNotification] = useState(null)
  const [showToken, setShowToken] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true)
      try {
        const data = await api.admin.getTelegramSettings()
        if (data) {
          setSettings({
            botToken: data.botToken || '',
            adminChatId: data.adminChatId || '',
            botUsername: data.botUsername || '',
            notificationsEnabled: data.notificationsEnabled ?? true,
            hasToken: Boolean(data.hasToken),
            maskedToken: data.maskedToken || '',
          })
          if (data.adminChatId) {
            setTestChatId(data.adminChatId)
          }
        }
      } catch (err) {
        console.error('Failed to load Telegram settings:', err)
        showToast('error', 'Не вдалося завантажити налаштування Telegram')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  function showToast(type, message) {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 4500)
  }

  async function handleSave(e) {
    e.preventDefault()
    setIsSaving(true)

    try {
      await api.admin.saveTelegramSettings({
        botToken: settings.botToken,
        adminChatId: settings.adminChatId,
        botUsername: settings.botUsername,
        notificationsEnabled: settings.notificationsEnabled,
      })
      showToast('success', 'Налаштування Telegram успішно збережено!')
      setSettings((prev) => ({
        ...prev,
        hasToken: Boolean(settings.botToken.trim()),
      }))
    } catch (err) {
      console.error('Failed to save Telegram settings:', err)
      showToast('error', err.message || 'Помилка збереження налаштувань')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTestSend(e) {
    e.preventDefault()
    const targetId = (testChatId || settings.adminChatId || '').trim()
    if (!targetId) {
      showToast('error', 'Вкажіть Chat ID для відправки тесту')
      return
    }

    if (!settings.botToken.trim()) {
      showToast('error', 'Спершу збережіть дійсний Bot Token')
      return
    }

    setIsTesting(true)
    try {
      await api.admin.testTelegram({ chatId: targetId })
      showToast('success', 'Тестове повідомлення успішно надіслано в Telegram!')
    } catch (err) {
      console.error('Telegram test error:', err)
      showToast('error', err.message || 'Помилка відправки в Telegram. Перевірте токен і Chat ID.')
    } finally {
      setIsTesting(false)
    }
  }

  const isConfigured = settings.hasToken && settings.adminChatId.trim()

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

      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <div className="admin-page-title-wrap">
            <h1 className="admin-page-title">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <SendIcon size={26} style={{ color: '#0ea5e9' }} />
                Telegram Бот та Сповіщення
              </span>
            </h1>
            <span className="admin-page-subtitle">
              Миттєві сповіщення адміністратора про нові замовлення та відгуки, а також повідомлення покупцям про статус їхніх замовлень
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-loading-state" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <RotateCcwIcon size={24} className="spinning" />
          <p style={{ marginTop: '0.75rem' }}>Завантаження налаштувань Telegram...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
          {/* Status Card */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: isConfigured ? '#86efac' : '#fed7aa',
              backgroundColor: isConfigured ? '#f0fdf4' : '#fff7ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: isConfigured ? '#dcfce7' : '#ffedd5',
                  color: isConfigured ? '#16a34a' : '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isConfigured ? <CheckCircleIcon size={24} /> : <AlertTriangleIcon size={24} />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                  {isConfigured
                    ? 'Telegram-бот налаштований та активний'
                    : 'Бот ще не налаштований'}
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  {isConfigured
                    ? 'Сповіщення про нові замовлення та відгуки надсилатимуться автоматично.'
                    : 'Вкажіть Bot Token від @BotFather та ваш Admin Chat ID нижче, щоб активувати сповіщення.'}
                </p>
              </div>
            </div>

            {settings.botUsername && (
              <a
                href={`https://t.me/${settings.botUsername}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <SendIcon size={16} />
                Відкрити @{settings.botUsername}
              </a>
            )}
          </div>

          {/* Main Settings Form Card */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#0f172a' }}>
              Основні параметри бота
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.5rem' }}>
              Усі налаштування зберігаються у базі даних і застосовуються миттєво без перезапуску сервера.
            </p>

            <form onSubmit={handleSave}>
              {/* Bot Token */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Telegram Bot Token <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showToken ? 'text' : 'password'}
                    placeholder="Наприклад: 7123456789:AAHfkjdsf987sdf78sdf6sd..."
                    value={settings.botToken}
                    onChange={(e) => setSettings((s) => ({ ...s, botToken: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 4rem 0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    {showToken ? 'Приховати' : 'Показати'}
                  </button>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                  Отримується у офіційного бота <b>@BotFather</b> через команду <code>/newbot</code>.
                </span>
              </div>

              {/* Admin Chat ID */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Admin Chat ID (куди надсилати нові заявки та відгуки) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Наприклад: 123456789 або -100123456789 для групи"
                  value={settings.adminChatId}
                  onChange={(e) => {
                    const val = e.target.value
                    setSettings((s) => ({ ...s, adminChatId: val }))
                    if (!testChatId) setTestChatId(val)
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                  Ваш персональний цифровий Chat ID або ID групи. Дізнатися його можна за 5 секунд у боті <b>@userinfobot</b> або <b>@getmyid_bot</b>.
                </span>
              </div>

              {/* Bot Username */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Юзернейм бота (без @)
                </label>
                <input
                  type="text"
                  placeholder="Наприклад: DiceDeckShopBot"
                  value={settings.botUsername}
                  onChange={(e) => setSettings((s) => ({ ...s, botUsername: e.target.value.replace('@', '') }))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                  Використовується для створення прямих посилань <code>https://t.me/ваш_бот</code> для покупців.
                </span>
              </div>

              {/* Notifications Toggle */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="notificationsEnabled"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => setSettings((s) => ({ ...s, notificationsEnabled: e.target.checked }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="notificationsEnabled" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                  Увімкнути надсилання сповіщень у Telegram
                </label>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="admin-btn-primary"
                style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
              >
                {isSaving ? 'Збереження...' : 'Зберегти налаштування'}
              </button>
            </form>
          </div>

          {/* Test Message Card */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#0f172a' }}>
              Перевірка зв'язку (Тестове повідомлення)
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem' }}>
              Надішліть тестове повідомлення, щоб переконатися, що бот налаштований і може писати у вказаний чат.
            </p>

            <form onSubmit={handleTestSend} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Введіть Chat ID для тесту..."
                value={testChatId}
                onChange={(e) => setTestChatId(e.target.value)}
                style={{
                  flex: '1',
                  minWidth: '240px',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                }}
              />
              <button
                type="submit"
                disabled={isTesting}
                className="admin-btn-secondary"
                style={{ padding: '0.65rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <SendIcon size={16} />
                {isTesting ? 'Відправка...' : 'Надіслати тест'}
              </button>
            </form>
          </div>

          {/* Step by Step Guide Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: '0 0 1rem' }}>
              📖 Коротка інструкція з налаштування:
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem', color: '#334155' }}>
              <div>
                <strong>1. Створення бота:</strong> Відкрийте Telegram, знайдіть бота <b>@BotFather</b>, напишіть йому команду <code>/newbot</code>, вкажіть назву та юзернейм. У відповідь ви отримаєте рядок з <b>API Token</b>.
              </div>
              <div>
                <strong>2. Отримання Chat ID:</strong> Відкрийте бота <b>@userinfobot</b> (або <b>@getmyid_bot</b>), натисніть <code>/start</code>. Бот надішле вам ваш числовий <b>Id</b> (наприклад: <code>542918234</code>).
              </div>
              <div>
                <strong>3. Обов'язковий крок!</strong> Відкрийте створеного вами бота та обов'язково натисніть <b>/start</b>, щоб дозволити боту писати вам (Telegram блокує повідомлення від ботів користувачам, які не запустили діалог першими).
              </div>
              <div>
                <strong>4. Як це працює для покупців:</strong> Покупець у своєму профілі або при оформленні замовлення може вказати свій Chat ID. Після цього бот надсилає йому квитанцію замовлення та сповіщає про будь-яку зміну статусу («В обробці», «Виконано» тощо).
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
