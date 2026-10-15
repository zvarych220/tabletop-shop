import { useState, useMemo } from 'react'
import { users as initialUsers } from '../../data/users.js'
import {
  EyeIcon,
  SearchIcon,
  RotateCcwIcon,
  UsersIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  SparklesIcon,
  ClipboardListIcon,
} from '../../components/ui/Icons.jsx'

const ROLES = [
  { value: 'user', label: 'Покупець', color: 'secondary' },
  { value: 'manager', label: 'Менеджер', color: 'info' },
  { value: 'admin', label: 'Адміністратор', color: 'danger' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState(initialUsers)
  const [selectedUser, setSelectedUser] = useState(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  function handleRoleChange(userId, newRole) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    )
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null))
    }
  }

  function getRoleBadge(role) {
    const roleData = ROLES.find((r) => r.value === role)
    return (
      <span className={`admin-badge admin-badge-${roleData?.color || 'secondary'}`}>
        <span className={`admin-badge-dot ${roleData?.color || 'secondary'}`} />
        {roleData?.label || role}
      </span>
    )
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Statistics
  const stats = useMemo(() => {
    const total = users.length
    const managers = users.filter((u) => u.role === 'manager').length
    const customers = users.filter((u) => u.role === 'user').length
    const admins = users.filter((u) => u.role === 'admin').length

    return { total, managers, customers, admins }
  }, [users])

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = user.name?.toLowerCase().includes(q)
        const matchEmail = user.email?.toLowerCase().includes(q)
        const matchPhone = user.phone?.toLowerCase().includes(q)
        if (!matchName && !matchEmail && !matchPhone) return false
      }
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false
      }
      return true
    })
  }, [users, searchQuery, roleFilter])

  function resetFilters() {
    setSearchQuery('')
    setRoleFilter('all')
  }

  const hasActiveFilters = searchQuery || roleFilter !== 'all'

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Управління користувачами</h1>
          <p className="admin-page-subtitle">
            Список зареєстрованих клієнтів, менеджерів та права доступу
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap primary">
            <UsersIcon size={22} />
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-label">Всього користувачів</span>
            <div className="admin-stat-value">{stats.total}</div>
            <span className="admin-stat-meta">В базі даних магазину</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap info">
            <ShieldCheckIcon size={22} />
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-label">Менеджерів</span>
            <div className="admin-stat-value">{stats.managers}</div>
            <span className="admin-stat-meta">Співробітники підтримки</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap success">
            <UserCircleIcon size={22} />
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-label">Покупців</span>
            <div className="admin-stat-value">{stats.customers}</div>
            <span className="admin-stat-meta">Клієнтські акаунти</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap purple">
            <SparklesIcon size={22} />
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-label">Адміністраторів</span>
            <div className="admin-stat-value">{stats.admins}</div>
            <span className="admin-stat-meta">Повний доступ до системи</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <SearchIcon size={18} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Пошук за ім'ям, email або телефоном..."
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="admin-select"
            aria-label="Фільтр за роллю"
          >
            <option value="all">Усі ролі</option>
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
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
          Відображено користувачів: <strong>{filteredUsers.length}</strong> з{' '}
          {users.length}
        </span>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        {filteredUsers.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <UsersIcon size={48} />
            </div>
            <h3 className="admin-empty-title">Користувачів не знайдено</h3>
            <p className="admin-empty-desc">
              Немає користувачів за заданими критеріями пошуку.
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
                  <th>Ім'я та ID</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Роль</th>
                  <th>Дата реєстрації</th>
                  <th style={{ textAlign: 'right', width: '90px' }}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="admin-table-row">
                    <td>
                      <div className="admin-user-cell">
                        <span className="admin-user-name">{user.name}</span>
                        <span className="admin-user-id">{user.id}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-user-email">{user.email}</span>
                    </td>
                    <td>
                      <span className="admin-user-phone">
                        {user.phone || '—'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-status-dropdown-wrap">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          className={`admin-status-select role-${user.role}`}
                          aria-label="Змінити роль користувача"
                        >
                          {ROLES.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>
                      <span className="admin-date">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div
                        className="admin-actions"
                        style={{ justifyContent: 'flex-end' }}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className="admin-btn-icon view"
                          title="Деталі профілю"
                          aria-label="Деталі"
                        >
                          <EyeIcon size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Профіль користувача</h2>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="admin-modal-close"
                aria-label="Закрити"
              >
                ×
              </button>
            </div>

            <div className="admin-modal-content">
              {/* User Header */}
              <div className="admin-user-detail-header">
                <div className="admin-user-detail-info">
                  <h3 className="admin-user-detail-name">
                    {selectedUser.name}
                  </h3>
                  <div className="admin-user-detail-meta-row">
                    {getRoleBadge(selectedUser.role)}
                    <span className="admin-chip">ID: {selectedUser.id}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="admin-detail-cards-grid single-col">
                <div className="admin-detail-card">
                  <h4 className="admin-detail-card-title">
                    <ClipboardListIcon size={18} style={{ marginRight: '0.5rem' }} />
                    Контактна інформація
                  </h4>
                  <div className="admin-detail-list">
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Email:</span>
                      <a
                        href={`mailto:${selectedUser.email}`}
                        className="admin-detail-link"
                      >
                        {selectedUser.email}
                      </a>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Телефон:</span>
                      <a
                        href={`tel:${selectedUser.phone}`}
                        className="admin-detail-link"
                      >
                        {selectedUser.phone || 'Не вказано'}
                      </a>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Місто / Адреса:</span>
                      <span className="admin-detail-value">
                        {selectedUser.address || selectedUser.city || 'Не вказано'}
                      </span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Дата реєстрації:</span>
                      <span className="admin-detail-value">
                        {formatDate(selectedUser.createdAt)}
                      </span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-label">Призначити роль:</span>
                      <select
                        value={selectedUser.role}
                        onChange={(e) =>
                          handleRoleChange(selectedUser.id, e.target.value)
                        }
                        className={`admin-status-select role-${selectedUser.role}`}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="admin-btn-secondary"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
