# 🎲 Dice & Deck - Інтеграція фронтенду з бекендом

## ✅ Що вже готово:

### Backend (PHP + MySQL)
- ✅ База даних автоматично розгорнута через `setup.php`
- ✅ 8 стартових ігор у БД
- ✅ 4 користувачі (включно з адміном)
- ✅ RESTful API працює на `http://localhost/tabletop-shop/backend/public/api`
- ✅ Система завантаження файлів (фото з ПК)
- ✅ Аутентифікація через Bearer Token

### Frontend (React + Vite)
- ✅ API сервіси підключені до бекенду
- ✅ AuthProvider оновлено для роботи з реальним API
- ✅ ProductsProvider підключено до бекенду
- ✅ FavoritesProvider підключено до API
- ✅ Конфігурація `.env.local` налаштована

---

## 🚀 Як запустити проєкт

### 1. Запустіть XAMPP
```bash
# Відкрийте XAMPP Control Panel
# Запустіть Apache та MySQL
```

### 2. База даних вже створена!
База даних автоматично розгорнута. Перевірте:
```
http://localhost/phpmyadmin
```
Повинна бути база даних `tabletop_shop` з 6 таблицями.

### 3. Перевірте API
Відкрийте в браузері:
```
http://localhost/tabletop-shop/backend/public/api
```

Ви повинні побачити:
```json
{
  "success": true,
  "data": {
    "message": "Dice & Deck API is running",
    "version": "1.0.0",
    "timestamp": "2026-10-20 13:46:00"
  }
}
```

### 4. Запустіть фронтенд
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/tabletop-shop
npm run dev
```

Відкрийте: http://localhost:5173

---

## 🔑 Тестові облікові записи

### Адміністратор
- **Email:** `admin@tabletop.com`
- **Пароль:** `admin123`
- **Права:** Повний доступ до всіх функцій

### Звичайні користувачі
1. **Тарас Шевченко**
   - Email: `taras.shevchenko@example.com`
   - Пароль: `password123`

2. **Леся Українка**
   - Email: `lesya.ukrainka@example.com`
   - Пароль: `password123`

3. **Іван Франко**
   - Email: `ivan.franko@example.com`
   - Пароль: `password123`

---

## 📸 Як додати товари з фото з ПК

### Через API (для розробників)

```javascript
import { api } from './services/api';

// 1. Завантажити фото
const file = document.querySelector('input[type="file"]').files[0];
const uploadResult = await api.upload(file, 'products');
// Отримаємо: { url: "http://localhost/...", path: "/uploads/..." }

// 2. Створити товар з завантаженим фото
const product = await api.products.create({
  title: 'Нова гра',
  category: 'Стратегія',
  players: '2-4 гравці',
  playTime: '60-90 хв',
  price: 1599.00,
  stockQuantity: 10,
  image: uploadResult.url, // URL завантаженого фото
  images: [{ url: uploadResult.url, isPrimary: true }],
  description: 'Опис гри'
});
```

### Через форму в адмін-панелі

1. Увійдіть як адмін (`admin@tabletop.com` / `admin123`)
2. Перейдіть в **Адмін-панель → Управління товарами**
3. Натисніть **"Додати товар"**
4. Виберіть фото з ПК через кнопку "Вибрати файл"
5. Заповніть форму та збережіть

Фото автоматично завантажиться на сервер у папку:
```
/Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/backend/public/uploads/products/
```

---

## 🛠 Корисні команди

### Перезапуск бази даних
Якщо потрібно очистити та перезавантажити БД:
```
http://localhost/tabletop-shop/backend/setup.php
```

### Перевірка API ендпоінтів

```bash
# Отримати всі товари
curl http://localhost/tabletop-shop/backend/public/api/products

# Логін
curl -X POST http://localhost/tabletop-shop/backend/public/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tabletop.com","password":"admin123"}'

# Завантажити фото (потрібен токен)
curl -X POST http://localhost/tabletop-shop/backend/public/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "category=products"
```

---

## 📁 Структура проєкту

```
tabletop-shop/
├── backend/
│   ├── config/          # Конфігурація БД та CORS
│   ├── database/        # SQL схема та seed дані
│   ├── public/
│   │   ├── uploads/     # 📸 Завантажені фото
│   │   │   ├── products/
│   │   │   └── avatars/
│   │   ├── index.php    # API роутер
│   │   └── .htaccess
│   ├── src/
│   │   ├── Controllers/ # Бізнес-логіка
│   │   ├── Models/      # Робота з БД
│   │   ├── Middleware/  # Аутентифікація
│   │   └── Utils/       # Допоміжні функції
│   ├── setup.php        # 🚀 Автоматичне розгортання БД
│   └── README.md
├── src/
│   ├── services/
│   │   └── api.js       # 🔗 API клієнт для фронтенду
│   ├── providers/       # React провайдери (оновлені)
│   └── hooks/           # React хуки
├── .env.local           # ✅ Конфігурація (вже налаштована)
└── README-INTEGRATION.md # Цей файл
```

---

## 🔧 Що змінено у фронтенді

### 1. API Клієнт (`src/services/api.js`)
Новий файл з усіма методами для роботи з бекендом:
- `api.auth.*` - аутентифікація
- `api.products.*` - товари
- `api.orders.*` - замовлення
- `api.favorites.*` - обране
- `api.admin.*` - адміністрування
- `api.upload()` - завантаження файлів

### 2. AuthProvider (`src/providers/AuthProvider.jsx`)
- ✅ Підключено до реального API
- ✅ Bearer Token аутентифікація
- ✅ Автоматичне завантаження користувача при старті

### 3. ProductsProvider (`src/providers/ProductsProvider.jsx`)
- ✅ Завантаження товарів з API
- ✅ CRUD операції (create, update, delete)
- ✅ Автоматичне оновлення списку

### 4. FavoritesProvider (`src/providers/FavoritesProvider.jsx`)
- ✅ Синхронізація з сервером
- ✅ Робота тільки для авторизованих користувачів

### 5. Конфігурація (`.env.local`)
```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost/tabletop-shop/backend/public/api
```

---

## ⚠️ Troubleshooting

### Помилка: "CORS blocked"
Перевірте `backend/config/cors.php` - фронтенд повинен бути в списку дозволених origins.

### Помилка: "Failed to fetch"
1. Переконайтеся, що Apache запущено
2. Перевірте URL: `http://localhost/tabletop-shop/backend/public/api`
3. Перевірте консоль браузера для деталей

### Помилка: "Unauthorized"
1. Увійдіть через форму логіну
2. Токен зберігається в localStorage як `authToken`
3. Перевірте, що токен передається в заголовку `Authorization: Bearer TOKEN`

### Фото не завантажуються
1. Переконайтеся, що папка `backend/public/uploads/products/` існує
2. Перевірте права доступу (chmod 755)
3. Максимальний розмір файлу: 5MB
4. Дозволені формати: JPG, PNG, GIF, WebP

---

## 📊 Тестування

### 1. Перевірка аутентифікації
```javascript
// У консолі браузера
const result = await api.auth.login({ 
  email: 'admin@tabletop.com', 
  password: 'admin123' 
});
console.log('Logged in:', result);
```

### 2. Перевірка товарів
```javascript
const products = await api.products.getAll();
console.log('Products:', products);
```

### 3. Перевірка обраного
```javascript
// Спочатку увійдіть
const result = await api.favorites.toggle('game-001');
console.log('Toggled favorite:', result);
```

---

## 🎉 Готово!

Тепер ваш проєкт повністю підключений до бекенду:
- ✅ Реальна база даних MySQL
- ✅ RESTful API на PHP
- ✅ Завантаження файлів (фото з ПК)
- ✅ Аутентифікація користувачів
- ✅ CRUD операції для товарів
- ✅ Система обраного
- ✅ Адмін-панель

**Насолоджуйтесь розробкою! 🚀**

---

## 📞 Додаткова інформація

### API Документація
Повна документація API: `backend/README.md`

### Безпека
- Паролі хешуються через BCRYPT
- SQL Injection захист через PDO Prepared Statements
- CORS налаштовано для localhost
- Bearer Token аутентифікація

### Підтримка
При виникненні проблем перевірте:
- Логи Apache: `XAMPP/logs/error_log`
- Консоль браузера (F12)
- Network tab для API запитів
