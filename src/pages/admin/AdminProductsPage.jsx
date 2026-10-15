import { useState, useMemo } from 'react'
import { boardGames } from '../../data/boardGames.js'
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  ImageIcon,
  SearchIcon,
  RotateCcwIcon,
  PackageIcon,
  SparklesIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from '../../components/ui/Icons.jsx'

export default function AdminProductsPage() {
  const [products, setProducts] = useState(boardGames)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [sortBy, setSortBy] = useState('default')

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    players: '',
    playTime: '',
    price: '',
    oldPrice: '',
    stockQuantity: '',
    description: '',
  })
  const [images, setImages] = useState([])

  // Dynamic categories list
  const categories = useMemo(() => {
    const set = new Set()
    products.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set).sort()
  }, [products])

  // Statistics
  const stats = useMemo(() => {
    const total = products.length
    const inStock = products.filter((p) => p.stockQuantity > 0).length
    const lowStock = products.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= 5
    ).length
    const outOfStock = products.filter((p) => p.stockQuantity === 0).length
    const totalValue = products.reduce(
      (acc, p) => acc + (p.price || 0) * (p.stockQuantity || 0),
      0
    )
    return { total, inStock, lowStock, outOfStock, totalValue }
  }, [products])

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim()
          const matchTitle = p.title?.toLowerCase().includes(query)
          const matchCategory = p.category?.toLowerCase().includes(query)
          const matchDesc = p.description?.toLowerCase().includes(query)
          if (!matchTitle && !matchCategory && !matchDesc) return false
        }
        // Category
        if (categoryFilter !== 'all' && p.category !== categoryFilter) {
          return false
        }
        // Stock
        if (stockFilter === 'inStock' && p.stockQuantity <= 0) return false
        if (
          stockFilter === 'lowStock' &&
          (p.stockQuantity <= 0 || p.stockQuantity > 5)
        )
          return false
        if (stockFilter === 'outOfStock' && p.stockQuantity > 0) return false

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        if (sortBy === 'name-asc') return a.title.localeCompare(b.title)
        if (sortBy === 'stock-desc') return b.stockQuantity - a.stockQuantity
        return 0
      })
  }, [products, searchQuery, categoryFilter, stockFilter, sortBy])

  function handleOpenModal(product = null) {
    if (product) {
      setEditingProduct(product)
      setFormData({
        title: product.title,
        category: product.category,
        players: product.players,
        playTime: product.playTime,
        price: product.price,
        oldPrice: product.oldPrice || '',
        stockQuantity: product.stockQuantity,
        description: product.description,
      })
      setImages(product.images || [])
    } else {
      setEditingProduct(null)
      setFormData({
        title: '',
        category: categories[0] || 'Стратегія',
        players: '2-4 гравці',
        playTime: '30-60 хв',
        price: '',
        oldPrice: '',
        stockQuantity: '10',
        description: '',
      })
      setImages([])
    }
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleAddImage() {
    const url = prompt('Введіть пряме URL посилання на зображення:')
    if (url && url.trim()) {
      setImages((prev) => [
        ...prev,
        {
          id: `img-${Date.now()}`,
          url: url.trim(),
          isPrimary: prev.length === 0,
        },
      ])
    }
  }

  function handleRemoveImage(id) {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id)
      // If deleted image was primary, make the first remaining primary
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true
      }
      return filtered
    })
  }

  function handleSetPrimary(id) {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === id }))
    )
  }

  function handleSubmit(e) {
    e.preventDefault()

    const primaryImage =
      images.find((img) => img.isPrimary) ||
      images[0] || {
        url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80',
      }
    const price = Number(formData.price)
    const oldPrice = formData.oldPrice ? Number(formData.oldPrice) : null
    const discount = oldPrice
      ? `-${Math.round(((oldPrice - price) / oldPrice) * 100)}%`
      : ''

    const productData = {
      ...formData,
      price,
      oldPrice,
      discount,
      stockQuantity: Number(formData.stockQuantity),
      inStock: Number(formData.stockQuantity) > 0,
      images,
      image: primaryImage.url,
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id ? { ...p, ...productData } : p
        )
      )
    } else {
      const newProduct = {
        id: `game-${Date.now()}`,
        ...productData,
        rating: 5,
        ratingCount: 1,
      }
      setProducts((prev) => [newProduct, ...prev])
    }

    handleCloseModal()
  }

  function handleDelete(id) {
    if (confirm('Ви впевнені, що хочете видалити цей товар?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  function resetFilters() {
    setSearchQuery('')
    setCategoryFilter('all')
    setStockFilter('all')
    setSortBy('default')
  }

  const hasActiveFilters =
    searchQuery || categoryFilter !== 'all' || stockFilter !== 'all' || sortBy !== 'default'

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Управління товарами</h1>
          <p className="admin-page-subtitle">
            Каталог настільних ігор, ціноутворення та управління залишками
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="admin-btn-primary"
        >
          <PlusIcon size={18} />
          <span>Додати товар</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap primary">
            <PackageIcon size={22} />
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-label">Всього найменувань</span>
            <div className="admin-stat-value">{stats.total}</div>
            <span className="admin-stat-meta">В каталозі магазину</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap success">
            <CheckCircleIcon size={22} />
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-label">В наявності</span>
            <div className="admin-stat-value">{stats.inStock}</div>
            <span className="admin-stat-meta">Готові до відправки</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap warning">
            <AlertTriangleIcon size={22} />
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-label">Закінчуються (≤ 5 шт)</span>
            <div className="admin-stat-value">{stats.lowStock}</div>
            <span className="admin-stat-meta">Потребують дозамовлення</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap purple">
            <SparklesIcon size={22} />
          </div>
          <div className="admin-stat-body">
            <span className="admin-stat-label">Загальна вартість складу</span>
            <div className="admin-stat-value">
              {stats.totalValue.toLocaleString('uk-UA')} ₴
            </div>
            <span className="admin-stat-meta">Оцінка складських запасів</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <SearchIcon size={18} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Пошук за назвою, категорією чи описом..."
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-select"
            aria-label="Фільтр за категорією"
          >
            <option value="all">Усі категорії</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="admin-select"
            aria-label="Фільтр за наявністю"
          >
            <option value="all">Будь-який статус</option>
            <option value="inStock">В наявності</option>
            <option value="lowStock">Закінчуються (≤ 5)</option>
            <option value="outOfStock">Немає в наявності</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="admin-select"
            aria-label="Сортування"
          >
            <option value="default">Сортування: замовчування</option>
            <option value="price-asc">Ціна: від дешевих</option>
            <option value="price-desc">Ціна: від дорогих</option>
            <option value="name-asc">Назва: А-Я</option>
            <option value="stock-desc">Залишок: найбільше</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="admin-btn-secondary admin-btn-reset"
              title="Скинути всі фільтри"
            >
              <RotateCcwIcon size={15} />
              <span>Скинути</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Meta Info */}
      <div className="admin-results-info">
        <span>
          Знайдено товарів: <strong>{filteredProducts.length}</strong> з{' '}
          {products.length}
        </span>
      </div>

      {/* Products Table */}
      <div className="admin-table-container">
        {filteredProducts.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <PackageIcon size={48} />
            </div>
            <h3 className="admin-empty-title">Товарів не знайдено</h3>
            <p className="admin-empty-desc">
              Спробуйте змінити пошуковий запит або скинути фільтри.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="admin-btn-primary"
              >
                Скинути всі фільтри
              </button>
            )}
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Фото</th>
                  <th>Назва товару</th>
                  <th>Категорія</th>
                  <th>Ціна</th>
                  <th>Залишок</th>
                  <th>Статус</th>
                  <th style={{ textAlign: 'right', width: '110px' }}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isLowStock =
                    product.stockQuantity > 0 && product.stockQuantity <= 5
                  const isOutOfStock = product.stockQuantity <= 0

                  return (
                    <tr key={product.id} className="admin-table-row">
                      <td>
                        <div className="admin-product-thumb-wrap">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="admin-table-img"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=150&q=80'
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="admin-product-cell">
                          <span className="admin-product-title">
                            {product.title}
                          </span>
                          <div className="admin-product-subtags">
                            {product.players && (
                              <span className="admin-chip">{product.players}</span>
                            )}
                            {product.playTime && (
                              <span className="admin-chip">{product.playTime}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-category-badge">
                          {product.category || 'Без категорії'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-price-cell">
                          <span className="admin-price-current">
                            {product.price.toLocaleString('uk-UA')} ₴
                          </span>
                          {product.oldPrice && (
                            <span className="admin-price-old">
                              {product.oldPrice.toLocaleString('uk-UA')} ₴
                            </span>
                          )}
                          {product.discount && (
                            <span className="admin-discount-badge">
                              {product.discount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="admin-stock-cell">
                          <span className="admin-stock-num">
                            {product.stockQuantity} шт
                          </span>
                          <div className="admin-stock-bar-mini">
                            <div
                              className={`admin-stock-bar-mini-fill ${
                                isOutOfStock
                                  ? 'danger'
                                  : isLowStock
                                    ? 'warning'
                                    : 'success'
                              }`}
                              style={{
                                width: `${Math.min(100, Math.max(8, product.stockQuantity * 5))}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        {isOutOfStock ? (
                          <span className="admin-badge admin-badge-danger">
                            <span className="admin-badge-dot danger" />
                            Немає
                          </span>
                        ) : isLowStock ? (
                          <span className="admin-badge admin-badge-warning">
                            <span className="admin-badge-dot warning" />
                            Закінчується
                          </span>
                        ) : (
                          <span className="admin-badge admin-badge-success">
                            <span className="admin-badge-dot success" />В наявності
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="admin-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenModal(product)}
                            className="admin-btn-icon edit"
                            title="Редагувати товар"
                            aria-label="Редагувати"
                          >
                            <EditIcon size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            className="admin-btn-icon danger"
                            title="Видалити товар"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">
                  {editingProduct ? 'Редагувати товар' : 'Додати новий товар'}
                </h2>
                <p className="admin-modal-subtitle">
                  {editingProduct
                    ? `Зміна параметрів для: ${editingProduct.title}`
                    : 'Заповніть характеристики настільної гри для публікації'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="admin-modal-close"
                aria-label="Закрити"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="admin-modal-content">
                <div className="admin-form-section">
                  <h4 className="admin-form-section-title">Основні дані</h4>
                  <div className="admin-form-row">
                    <div className="admin-form-group flex-2">
                      <label className="admin-form-label">
                        Назва гри <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="admin-form-input"
                        placeholder="Наприклад: Дюна: Імперіум"
                        required
                      />
                    </div>

                    <div className="admin-form-group flex-1">
                      <label className="admin-form-label">
                        Категорія <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="admin-form-input"
                        placeholder="Стратегія, Паті-гра..."
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Кількість гравців <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        name="players"
                        value={formData.players}
                        onChange={handleChange}
                        className="admin-form-input"
                        placeholder="1-4 гравці"
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Тривалість партії <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        name="playTime"
                        value={formData.playTime}
                        onChange={handleChange}
                        className="admin-form-input"
                        placeholder="60-120 хв"
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Опис товару <span className="req">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="admin-form-textarea"
                      rows="3"
                      placeholder="Детальний опис гри, механік та тематики..."
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-section">
                  <h4 className="admin-form-section-title">Ціна та складські запаси</h4>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Поточна ціна (грн) <span className="req">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="admin-form-input"
                        placeholder="2150"
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Стара ціна / Без знижки (грн)
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="oldPrice"
                        value={formData.oldPrice}
                        onChange={handleChange}
                        className="admin-form-input"
                        placeholder="2500"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">
                        Кількість на складі <span className="req">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleChange}
                        className="admin-form-input"
                        placeholder="15"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-form-section">
                  <div className="admin-form-section-header">
                    <div>
                      <h4 className="admin-form-section-title">
                        Галерея зображень
                      </h4>
                      <p className="admin-form-section-sub">
                        Додайте прямі URL зображень товару
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="admin-btn-secondary admin-btn-sm"
                    >
                      <ImageIcon size={16} />
                      <span>+ Додати фото</span>
                    </button>
                  </div>

                  {images.length === 0 ? (
                    <div className="admin-images-empty">
                      <p>Не додано жодного зображення. Буде використано фото за замовчуванням.</p>
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="admin-btn-secondary admin-btn-xs"
                      >
                        Додати URL фото
                      </button>
                    </div>
                  ) : (
                    <div className="admin-images-grid">
                      {images.map((img) => (
                        <div
                          key={img.id}
                          className={`admin-image-card ${
                            img.isPrimary ? 'is-primary' : ''
                          }`}
                        >
                          <img src={img.url} alt="Прев'ю товару" />
                          <div className="admin-image-actions">
                            {img.isPrimary ? (
                              <span className="admin-primary-badge">
                                ★ Головне
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(img.id)}
                                className="admin-btn-xs admin-btn-set-primary"
                              >
                                Зробити головним
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.id)}
                              className="admin-btn-xs admin-btn-danger"
                            >
                              Видалити
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="admin-btn-secondary"
                >
                  Скасувати
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingProduct ? 'Зберегти зміни' : 'Створити товар'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
