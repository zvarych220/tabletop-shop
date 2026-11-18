# Документація RESTful API (Dice & Deck Backend)

Цей документ містить повний опис серверного API вебзастосунку **«Dice & Deck»**. Бекенд розроблено на PHP 8.1+ із використанням архітектурного патерну Front Controller / REST, PDO для взаємодії з СУБД MySQL та JSON-відповідей єдиного формату.

---

## 1. Загальні положення

- **Базова адреса API:** `http://localhost/tabletop-shop/backend/public/api` (або `http://localhost:8000/api` залежно від веб-сервера)
- **Формат обміну даними:** `application/json` (за винятком завантаження файлів `multipart/form-data`)
- **Кодування:** UTF-8
- **Часовий пояс сервера:** `Europe/Kiev`

### 1.1. Стандартний формат відповіді (Response Envelope)

Кожна відповідь сервера містить уніфікований JSON-об'єкт:

#### Успішна відповідь:
```json
{
  "success": true,
  "data": { ... },
  "message": "Операція успішно виконана",
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  }
}
```

#### Помилка:
```json
{
  "success": false,
  "error": "Текст головної помилки",
  "errors": {
    "email": "Користувач з таким email вже існує",
    "password": "Пароль має містити щонайменше 6 символів"
  }
}
```

### 1.2. Коди статусів HTTP

| Код | Значення | Опис |
| :--- | :--- | :--- |
| **`200 OK`** | Успіх | Запит успішно оброблено, повернуто запитувані дані. |
| **`201 Created`** | Створено | Новий ресурс (товар, замовлення, користувача) успішно збережено в БД. |
| **`400 Bad Request`** | Помилка даних | Відсутні обов'язкові поля або передані дані не пройшли валідацію. |
| **`401 Unauthorized`** | Неавторизовано | Відсутній або недійсний Bearer-токен авторизації. |
| **`403 Forbidden`** | Заборонено | Недостатньо прав для виконання дії (наприклад, звичайний користувач у розділі адміна). |
| **`404 Not Found`** | Не знайдено | Запитуваний ресурс або ендпоінт відсутній. |
| **`405 Method Not Allowed`**| Метод не дозволено | Запит надіслано з непідтримуваним HTTP-методом. |
| **`500 Server Error`** | Помилка сервера | Непередбачувана помилка бази даних або внутрішня виняткова ситуація. |

---

## 2. Аутентифікація та авторизація (Bearer Token)

Для доступу до захищених ендпоінтів клієнт повинен передавати токен у HTTP-заголовку:

```http
Authorization: Bearer <auth_token>
```

Токен генерується сервером при успішній реєстрації або вході та зберігається у `localStorage` клієнта під ключем `authToken`.

---

## 3. Перелік ендпоінтів API

### 3.1. Аутентифікація (`/api/auth`)

#### 1. Реєстрація нового користувача
- **Метод:** `POST /api/auth/register`
- **Авторизація:** Не потрібна
- **Тіло запиту (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "Олександр Петренко",
    "phone": "+380501234567"
  }
  ```
- **Відповідь (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "usr-12345",
        "email": "user@example.com",
        "name": "Олександр Петренко",
        "role": "user"
      },
      "token": "a1b2c3d4e5f6..."
    },
    "message": "User registered successfully"
  }
  ```

#### 2. Вхід користувача (Login)
- **Метод:** `POST /api/auth/login`
- **Авторизація:** Не потрібна
- **Тіло запиту (JSON):**
  ```json
  {
    "email": "admin@tabletop.com",
    "password": "admin123"
  }
  ```
- **Відповідь (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "usr-admin-01",
        "email": "admin@tabletop.com",
        "name": "Головний Адміністратор",
        "role": "admin"
      },
      "token": "tok_99887766..."
    }
  }
  ```

#### 3. Отримання поточного профілю
- **Метод:** `GET /api/auth/me`
- **Авторизація:** `Bearer <token>`
- **Відповідь (`200 OK`):** повертає повні дані поточного авторизованого користувача.

#### 4. Оновлення профілю
- **Метод:** `PUT /api/auth/profile`
- **Авторизація:** `Bearer <token>`
- **Тіло запиту:** `{ "name": "...", "phone": "...", "address": "...", "avatar": "..." }`

#### 5. Вихід із системи (Logout)
- **Метод:** `POST /api/auth/logout`
- **Авторизація:** `Bearer <token>`

---

### 3.2. Товари та каталог (`/api/products`)

#### 1. Отримання списку товарів (із фільтрами, пошуком та сортуванням)
- **Метод:** `GET /api/products`
- **Авторизація:** Не потрібна
- **Query-параметри:**
  - `q` (string): рядок пошуку за назвою, категорією або описом;
  - `category` (string): фільтр за категорією;
  - `minPrice`, `maxPrice` (number): діапазон цін;
  - `inStock` (boolean / 1): фільтр «лише в наявності»;
  - `sortBy` (string): поле сортування (`price`, `rating`, `title`, `created_at`);
  - `sortOrder` (string): порядок (`ASC` | `DESC`);
  - `page` (number): номер сторінки (за замовчуванням 1);
  - `limit` (number): кількість елементів на сторінці (за замовчуванням 12 або 50).
- **Відповідь (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "game-001",
        "title": "Catan: Колонізатори",
        "category": "Стратегія",
        "players": "3-4",
        "playTime": "60-90 хв",
        "price": 1450.00,
        "oldPrice": 1650.00,
        "discount": "-12%",
        "inStock": true,
        "stockQuantity": 15,
        "rating": 4.9,
        "ratingCount": 12,
        "image": "/uploads/products/catan.jpg",
        "description": "Культова настільна гра про розвиток поселень..."
      }
    ]
  }
  ```

#### 2. Отримання окремої гри за ID
- **Метод:** `GET /api/products/{id}`
- **Авторизація:** Не потрібна

#### 3. Створення нового товару
- **Метод:** `POST /api/products`
- **Авторизація:** `Bearer <token>` (тільки `admin` або `manager`)
- **Тіло запиту:**
  ```json
  {
    "title": "Дюна: Імперіум",
    "category": "Стратегія",
    "players": "1-4",
    "playTime": "60-120 хв",
    "price": 2200.00,
    "inStock": true,
    "stockQuantity": 8,
    "image": "/uploads/products/dune.jpg",
    "description": "Боротьба за пустельну планету Арракіс..."
  }
  ```

#### 4. Оновлення товару
- **Метод:** `PUT /api/products/{id}`
- **Авторизація:** `Bearer <token>` (роль `admin` / `manager`)

#### 5. Видалення товару
- **Метод:** `DELETE /api/products/{id}`
- **Авторизація:** `Bearer <token>` (роль `admin`)

---

### 3.3. Відгуки та рецензії (`/api/products/{id}/reviews` та `/api/reviews`)

#### 1. Отримання відгуків гри
- **Метод:** `GET /api/products/{productId}/reviews`
- **Авторизація:** Не потрібна (повертає лише затверджені відгуки `status = 'approved'`).

#### 2. Додавання відгуку користувачем
- **Метод:** `POST /api/products/{productId}/reviews`
- **Авторизація:** Необов'язкова (якщо користувач залогінений, його `user_id` фіксується автоматично).
- **Тіло запиту:**
  ```json
  {
    "authorName": "Дмитро",
    "rating": 5,
    "comment": "Неймовірна гра! Якісні компоненти та дуже швидка партія."
  }
  ```
- *Примітка:* Новостворений відгук одержує статус `pending` та чекає на схвалення модератором.

#### 3. Список усіх відгуків для модерації (Адмін)
- **Метод:** `GET /api/reviews?status=pending`
- **Авторизація:** `Bearer <token>` (`admin` / `manager`)
- **Відповідь:** повертає список відгуків та об'єкт лічильників `counts: { total, pending, approved, rejected }`.

#### 4. Зміна статусу відгуку
- **Метод:** `PUT /api/reviews/{id}/status`
- **Авторизація:** `Bearer <token>` (`admin` / `manager`)
- **Тіло запиту:** `{ "status": "approved" }` або `{ "status": "rejected" }`

#### 5. Видалення відгуку
- **Метод:** `DELETE /api/reviews/{id}`
- **Авторизація:** `Bearer <token>` (`admin`)

---

### 3.4. Замовлення (`/api/orders`)

#### 1. Отримання списку замовлень
- **Метод:** `GET /api/orders`
- **Авторизація:** `Bearer <token>`
- *Примітка:* Звичайний користувач бачить лише власні замовлення (`user_id`). Адміністратор та менеджер бачать усі замовлення магазину з можливістю фільтрації за `status`, `search` (ПІБ, телефон) та сортування за датою або сумою.

#### 2. Створення замовлення (Checkout)
- **Метод:** `POST /api/orders`
- **Авторизація:** Необов'язкова (підтримує як гостей, так і авторизованих клієнтів).
- **Тіло запиту:**
  ```json
  {
    "fullName": "Максим Ковальчук",
    "phone": "+380671234567",
    "deliveryService": "nova_poshta",
    "city": "Київ",
    "branch": "Відділення №42 (вул. Січових Стрільців, 10)",
    "paymentMethod": "cash_on_delivery",
    "comment": "Зателефонуйте після 18:00",
    "telegramChatId": "123456789",
    "orderedItems": [
      { "gameId": "game-001", "quantity": 1, "price": 1450.00, "title": "Catan" },
      { "gameId": "game-003", "quantity": 2, "price": 450.00, "title": "Dixit" }
    ]
  }
  ```
- **Серверна дія:**
  1. Валідація полів.
  2. Генерація унікального номера замовлення.
  3. Збереження запису в таблицю `orders` та переліку позицій в `order_items`.
  4. Списання залишків зі складу (`products.stock_quantity`).
  5. Відправка повідомлення в Telegram адміністратору та покупцю через `TelegramService`.
  6. Повернення об'єкта створеного замовлення (`201 Created`).

#### 3. Отримання окремого замовлення за ID
- **Метод:** `GET /api/orders/{id}`
- **Авторизація:** `Bearer <token>` (або гостьовий доступ за збігом сесії)

#### 4. Оновлення статусу замовлення
- **Метод:** `PUT /api/orders/{id}/status`
- **Авторизація:** `Bearer <token>` (`admin` / `manager`)
- **Тіло запиту:** `{ "status": "processing" }` (допустимі: `pending`, `processing`, `completed`, `cancelled`)

#### 5. Повне оновлення даних замовлення
- **Метод:** `PUT /api/orders/{id}`
- **Авторизація:** `Bearer <token>` (`admin` / `manager`)

#### 6. Видалення замовлення
- **Метод:** `DELETE /api/orders/{id}`
- **Авторизація:** `Bearer <token>` (`admin`)

---

### 3.5. Список обраного (`/api/favorites`)

#### 1. Отримати список обраних ігор
- **Метод:** `GET /api/favorites`
- **Авторизація:** `Bearer <token>`
- **Відповідь:** масив ігор або масив ідентифікаторів `gameId`.

#### 2. Додати / видалити з обраного (Toggle)
- **Метод:** `POST /api/favorites/toggle`
- **Авторизація:** `Bearer <token>`
- **Тіло запиту:** `{ "gameId": "game-001" }`
- **Відповідь:** `{ "success": true, "isFavorite": true }`

#### 3. Очистити список обраного
- **Метод:** `DELETE /api/favorites`
- **Авторизація:** `Bearer <token>`

---

### 3.6. Адміністрування користувачів (`/api/admin/users`)

#### 1. Список усіх користувачів
- **Метод:** `GET /api/admin/users`
- **Авторизація:** `Bearer <token>` (`admin`)
- **Query-параметри:** `search`, `role`, `sortBy`, `sortOrder`

#### 2. Зміна ролі користувача
- **Метод:** `PUT /api/admin/users/{id}/role`
- **Авторизація:** `Bearer <token>` (`admin`)
- **Тіло запиту:** `{ "role": "manager" }` (допустимі значення: `user`, `manager`, `admin`)

---

### 3.7. Аналітика магазину (`/api/admin/analytics`)

- **Метод:** `GET /api/admin/analytics`
- **Авторизація:** `Bearer <token>` (`admin` / `manager`)
- **Відповідь:**
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "totalRevenue": 154200.00,
        "totalOrders": 128,
        "completedOrders": 96,
        "activeUsers": 84,
        "averageCheck": 1204.68
      },
      "revenueByMonth": [
        { "month": "2026-08", "revenue": 34000 },
        { "month": "2026-09", "revenue": 52000 },
        { "month": "2026-10", "revenue": 68200 }
      ],
      "topSellingProducts": [
        { "id": "game-001", "title": "Catan", "soldCount": 42, "revenue": 60900.00 }
      ],
      "ordersByStatus": {
        "pending": 6,
        "processing": 12,
        "completed": 96,
        "cancelled": 14
      }
    }
  }
  ```

---

### 3.8. Інтеграція з Telegram (`/api/admin/telegram`)

#### 1. Отримання поточних налаштувань Telegram
- **Метод:** `GET /api/admin/telegram`
- **Авторизація:** `Bearer <token>` (`admin`)
- **Відповідь:**
  ```json
  {
    "success": true,
    "data": {
      "hasToken": true,
      "maskedToken": "718293••••••••••••aB91cD",
      "adminChatId": "123456789",
      "botUsername": "DiceDeckShopBot",
      "notificationsEnabled": true
    }
  }
  ```

#### 2. Збереження налаштувань Telegram
- **Метод:** `POST /api/admin/telegram`
- **Авторизація:** `Bearer <token>` (`admin`)
- **Тіло запиту:**
  ```json
  {
    "botToken": "7182930412:AAH9...",
    "adminChatId": "123456789",
    "botUsername": "DiceDeckShopBot",
    "notificationsEnabled": true
  }
  ```

#### 3. Тестова відправка повідомлення в Telegram
- **Метод:** `POST /api/admin/telegram/test`
- **Авторизація:** `Bearer <token>` (`admin`)
- **Тіло запиту:** `{ "chatId": "123456789" }` (якщо не вказано — використовується збережений `adminChatId`).

---

### 3.9. Завантаження медіа-файлів (`/api/upload`)

- **Метод:** `POST /api/upload`
- **Авторизація:** `Bearer <token>` (`admin` / `manager` / `user`)
- **Формат запиту:** `multipart/form-data`
- **Поля форми:**
  - `file`: бінарний файл зображення (JPEG, PNG, WEBP, GIF; максимальний розмір 5 MB);
  - `category`: директорія призначення (`products` або `avatars`).
- **Відповідь (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "url": "http://localhost/tabletop-shop/backend/public/uploads/products/game-catan-172942.jpg",
      "path": "/uploads/products/game-catan-172942.jpg"
    },
    "message": "File uploaded successfully"
  }
  ```

