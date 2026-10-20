# 🎲 Dice & Deck Tabletop Shop - Backend API

Повнофункціональний RESTful API бекенд для інтернет-магазину настільних ігор, створений на чистому PHP 8.1+ з MySQL.

## 📋 Зміст

- [Технології](#технології)
- [Структура проєкту](#структура-проєкту)
- [Встановлення та налаштування](#встановлення-та-налаштування)
- [API Ендпоінти](#api-ендпоінти)
- [Аутентифікація](#аутентифікація)
- [Підключення фронтенду](#підключення-фронтенду)
- [Тестування API](#тестування-api)

---

## 🛠 Технології

- **PHP**: 8.1+
- **База даних**: MySQL 8.0+ (InnoDB, UTF-8 mb4)
- **Веб-сервер**: Apache (XAMPP)
- **Архітектура**: RESTful API, MVC Pattern
- **Безпека**: 
  - PDO Prepared Statements (захист від SQL Injection)
  - Password Hashing (BCRYPT)
  - Bearer Token Authentication
  - CORS Configuration

---

## 📁 Структура проєкту

```
backend/
├── config/
│   ├── database.php       # Підключення до MySQL через PDO
│   └── cors.php           # Налаштування CORS
├── database/
│   ├── schema.sql         # Структура бази даних (DDL)
│   └── seed.sql           # Тестові дані
├── src/
│   ├── Controllers/       # Контролери для обробки запитів
│   │   ├── AuthController.php
│   │   ├── ProductController.php
│   │   ├── OrderController.php
│   │   ├── FavoriteController.php
│   │   └── AdminController.php
│   ├── Middleware/        # Middleware для аутентифікації
│   │   └── AuthMiddleware.php
│   ├── Models/            # Моделі для роботи з БД
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── Order.php
│   │   └── Favorite.php
│   └── Utils/             # Утиліти
│       ├── Response.php   # JSON відповіді
│       └── Validator.php  # Валідація даних
├── public/
│   ├── .htaccess          # Apache URL rewriting
│   └── index.php          # Front Controller (точка входу)
├── .env.example           # Приклад конфігурації
└── README.md
```

---

## ⚙️ Встановлення та налаштування

### Крок 1: Запуск XAMPP

1. Відкрийте **XAMPP Control Panel**
2. Запустіть модулі:
   - ✅ **Apache** (веб-сервер)
   - ✅ **MySQL** (база даних)

### Крок 2: Створення бази даних

#### Варіант A: Через phpMyAdmin (рекомендовано)

1. Відкрийте браузер і перейдіть: http://localhost/phpmyadmin
2. Натисніть **"New"** (Створити) в лівій панелі
3. Введіть ім'я бази даних: `tabletop_shop`
4. Виберіть кодування: `utf8mb4_unicode_ci`
5. Натисніть **"Create"**

#### Варіант B: Через MySQL консоль

```bash
# Відкрийте термінал XAMPP Shell або командний рядок
mysql -u root -p

# У консолі MySQL виконайте:
CREATE DATABASE tabletop_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### Крок 3: Імпорт структури та даних

#### Через phpMyAdmin:

1. Виберіть базу даних `tabletop_shop` в лівій панелі
2. Перейдіть на вкладку **"Import"** (Імпорт)
3. Натисніть **"Choose File"** та виберіть файл `backend/database/schema.sql`
4. Натисніть **"Go"** (Виконати)
5. Повторіть процес для файла `backend/database/seed.sql`

#### Через командний рядок:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/backend

# Імпорт структури
mysql -u root tabletop_shop < database/schema.sql

# Імпорт тестових даних
mysql -u root tabletop_shop < database/seed.sql
```

### Крок 4: Перевірка встановлення

Відкрийте браузер і перейдіть за адресою:

```
http://localhost/tabletop-shop/backend/public/api
```

Ви повинні побачити JSON відповідь:

```json
{
  "success": true,
  "data": {
    "message": "Dice & Deck API is running",
    "version": "1.0.0",
    "timestamp": "2026-10-20 13:36:00"
  }
}
```

✅ **Готово!** API працює.

---

## 🔐 Аутентифікація

API використовує **Bearer Token** аутентифікацію.

### Тестові облікові записи

**Адміністратор:**
- Email: `admin@tabletop.com`
- Пароль: `admin123`

**Звичайні користувачі:**
- Email: `taras.shevchenko@example.com` | Пароль: `password123`
- Email: `lesya.ukrainka@example.com` | Пароль: `password123`
- Email: `ivan.franko@example.com` | Пароль: `password123`

### Як використовувати токен

1. **Авторизуйтесь** через `/api/auth/login`
2. **Отримайте токен** з відповіді
3. **Додайте токен** до заголовків наступних запитів:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📡 API Ендпоінти

### Аутентифікація

| Метод | Ендпоінт | Опис | Авторизація |
|-------|----------|------|-------------|
| `POST` | `/api/auth/register` | Реєстрація користувача | Ні |
| `POST` | `/api/auth/login` | Вхід в систему | Ні |
| `GET` | `/api/auth/me` | Отримати поточного користувача | Так |
| `PUT` | `/api/auth/profile` | Оновити профіль | Так |
| `POST` | `/api/auth/logout` | Вихід | Так |

### Товари (Products)

| Метод | Ендпоінт | Опис | Авторизація |
|-------|----------|------|-------------|
| `GET` | `/api/products` | Список товарів (з фільтрами) | Ні |
| `GET` | `/api/products/{id}` | Деталі товару | Ні |
| `POST` | `/api/products` | Створити товар | Admin/Manager |
| `PUT` | `/api/products/{id}` | Оновити товар | Admin/Manager |
| `DELETE` | `/api/products/{id}` | Видалити товар | Admin/Manager |

**Query параметри для GET /api/products:**
- `search` - пошук за назвою, категорією, описом
- `category` - фільтр за категорією
- `stock` - фільтр за наявністю (`inStock`, `lowStock`, `outOfStock`)
- `sort` - сортування (`price-asc`, `price-desc`, `name-asc`, `stock-desc`)

### Замовлення (Orders)

| Метод | Ендпоінт | Опис | Авторизація |
|-------|----------|------|-------------|
| `GET` | `/api/orders` | Список замовлень | Так |
| `GET` | `/api/orders/{id}` | Деталі замовлення | Так |
| `POST` | `/api/orders` | Створити замовлення | Ні (можливо без авторизації) |
| `PUT` | `/api/orders/{id}` | Оновити замовлення | Так |
| `DELETE` | `/api/orders/{id}` | Видалити замовлення | Admin |

### Обране (Favorites)

| Метод | Ендпоінт | Опис | Авторизація |
|-------|----------|------|-------------|
| `GET` | `/api/favorites` | Список обраних ігор | Так |
| `POST` | `/api/favorites/toggle` | Додати/видалити з обраного | Так |
| `DELETE` | `/api/favorites` | Очистити всі обрані | Так |

### Адміністрування

| Метод | Ендпоінт | Опис | Авторизація |
|-------|----------|------|-------------|
| `GET` | `/api/admin/users` | Список користувачів | Admin |
| `PUT` | `/api/admin/users/{id}/role` | Змінити роль користувача | Admin |
| `GET` | `/api/admin/analytics` | Аналітика та статистика | Admin/Manager |

---

## 🔗 Підключення фронтенду

### Крок 1: Налаштувати змінні оточення

Створіть файл `.env.local` в кореневій папці фронтенду:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost/tabletop-shop/backend/public/api
```

### Крок 2: Оновити API сервіси

Переконайтеся, що фронтенд використовує правильний базовий URL:

```javascript
// src/config/api.js або подібний файл
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/tabletop-shop/backend/public/api';
```

### Крок 3: Перемкнути з localStorage на API

У ваших сервісах (наприклад, `apiOrderService.js`, `useProducts.js`):

```javascript
// Замість:
// const orders = JSON.parse(localStorage.getItem('orders') || '[]');

// Використовуйте:
const response = await fetch(`${API_BASE_URL}/orders`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
const orders = data.data;
```

### Приклад запиту з токеном

```javascript
const token = localStorage.getItem('authToken');

async function getProducts() {
  const response = await fetch('http://localhost/tabletop-shop/backend/public/api/products');
  const data = await response.json();
  return data.data; // масив товарів
}

async function createOrder(orderData) {
  const response = await fetch('http://localhost/tabletop-shop/backend/public/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(orderData)
  });
  
  const result = await response.json();
  return result.data;
}
```

---

## 🧪 Тестування API

### Використання cURL

```bash
# Отримати всі товари
curl http://localhost/tabletop-shop/backend/public/api/products

# Авторизація
curl -X POST http://localhost/tabletop-shop/backend/public/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tabletop.com","password":"admin123"}'

# Створити замовлення
curl -X POST http://localhost/tabletop-shop/backend/public/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Іван Петренко",
    "phone": "+380501234567",
    "deliveryService": "nova_poshta",
    "city": "Київ",
    "branch": "Відділення №1",
    "paymentMethod": "cash_on_delivery",
    "durationHours": 2,
    "orderedItems": [
      {
        "gameId": "game-001",
        "title": "Дюна: Імперіум",
        "price": 1899,
        "quantity": 1
      }
    ]
  }'
```

### Використання Postman або Insomnia

1. Створіть нову колекцію
2. Встановіть Base URL: `http://localhost/tabletop-shop/backend/public/api`
3. Для захищених ендпоінтів додайте заголовок:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN`

---

## 🔒 Безпека

### Реалізовані заходи безпеки:

✅ **SQL Injection Protection** - всі запити через PDO Prepared Statements  
✅ **Password Hashing** - паролі хешуються через `password_hash()` (BCRYPT)  
✅ **CORS Configuration** - контроль доступу з фронтенду  
✅ **Token-based Authentication** - Bearer токени з підписом HMAC  
✅ **Input Validation** - валідація всіх вхідних даних  
✅ **Error Handling** - безпечна обробка помилок без витоку інформації  

### Рекомендації для продакшну:

1. Змініть `JWT_SECRET` у файлі `.env`
2. Встановіть `display_errors = 0` у `php.ini`
3. Використовуйте HTTPS замість HTTP
4. Налаштуйте регулярні бекапи бази даних
5. Обмежте CORS тільки до потрібних доменів

---

## 📝 Формат відповідей

Всі відповіді у форматі JSON:

**Успішна відповідь:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Помилка:**
```json
{
  "success": false,
  "error": "Error message",
  "errors": { 
    "field": "Validation error"
  }
}
```

**HTTP коди:**
- `200` OK
- `201` Created
- `204` No Content
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `422` Validation Error
- `500` Internal Server Error

---

## 🐛 Troubleshooting

### Помилка: "Database connection failed"

**Рішення:**
1. Переконайтеся, що MySQL запущено в XAMPP
2. Перевірте параметри з'єднання в `backend/config/database.php`
3. Переконайтеся, що база даних `tabletop_shop` існує

### Помилка: "404 Not Found"

**Рішення:**
1. Переконайтеся, що Apache запущено
2. Перевірте, що файл `.htaccess` існує в `backend/public/`
3. Переконайтеся, що модуль `mod_rewrite` увімкнено в Apache

### CORS помилки у браузері

**Рішення:**
1. Перевірте налаштування CORS в `backend/config/cors.php`
2. Додайте ваш домен фронтенду до масиву `$allowedOrigins`

### Помилка: "Unauthorized"

**Рішення:**
1. Переконайтеся, що токен правильно додано до заголовка `Authorization`
2. Перевірте формат: `Bearer YOUR_TOKEN`
3. Токен діє 30 днів - можливо, він застарів

---

## 📞 Підтримка

При виникненні проблем перевірте:
- Логи Apache: `XAMPP/logs/error_log`
- Логи PHP: `XAMPP/logs/php_error_log`

---

**Автор:** Dice & Deck Development Team  
**Версія:** 1.0.0  
**Дата:** Жовтень 2026
