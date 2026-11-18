# Документація проєкту «Dice & Deck» (Tabletop Shop)

Ласкаво просимо до центру технічної та користувацької документації вебзастосунку **«Dice & Deck»** — сучасного інтернет-магазину та клубу настільних ігор.

---

## 📚 Зміст документації

| Розділ | Посилання | Опис |
| :--- | :--- | :--- |
| **Специфікація та план** | [project-plan.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/project-plan.md) | Концепція, аналіз предметної області, модель сутностей, Use Cases для всіх груп користувачів та roadmap реалізації від Л 1.1 до Fullstack. |
| **Архітектура клієнта** | [component-architecture.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/component-architecture.md) | Компонентна декомпозиція React, 7 провайдерів Context API, власні хуки (Custom Hooks), маршрутизація React Router v7, доменна валідація та дизайн-система стилів. |
| **Специфікація REST API** | [api-reference.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/api-reference.md) | Повний опис серверних ендпоінтів PHP: аутентифікація, товари, замовлення, кошик, відгуки, адміністрування, завантаження файлів, формати JSON і Bearer-авторизація. |
| **Схема бази даних** | [database-schema.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/database-schema.md) | Детальний опис СУБД MySQL: таблиці, типи даних, первинні та зовнішні ключі (Foreign Keys), індекси, каскадні дії та Mermaid ER-діаграма. |
| **Telegram-інтеграція** | [telegram-integration.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/telegram-integration.md) | Архітектура Telegram Bot API: отримання токена, сповіщення адміністратора про замовлення, повідомлення клієнту, тестування з адмінки. |
| **Розгортання та запуск** | [deployment-guide.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/deployment-guide.md) | Покрокова інструкція запуску в середовищі XAMPP/LAMP, автоматичний мігратор `setup.php`, змінні оточення, build для production та вирішення проблем. |
| **Керівництво адміністратора** | [admin-manual.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/admin-manual.md) | Посібник користувача панелі керування: завантаження фотографій з ПК, редагування цін, зміна статусів замовлень, модерація відгуків, аналітика продажів. |

---

## 🛠 Технологічний стек проєкту

### Frontend (Клієнтська частина)
- **Фреймворк:** React 19 (Strict Mode, Hooks, Functional Architecture)
- **Збирач:** Vite 6
- **Маршрутизація:** React Router v7
- **Управління станом:** React Context API (AuthProvider, AdminProvider, ProductsProvider, CartProvider, FavoritesProvider, OrdersProvider, BoardGameSelectionProvider)
- **Сховище:** LocalStorage + REST API
- **Стилізація:** Модульний чистий CSS (Custom Properties, BEM, адаптивна верстка Flexbox/Grid)

### Backend (Серверна частина)
- **Мова:** PHP 8.1+
- **Архітектура:** RESTful API, Front Controller, MVC Pattern
- **База даних:** MySQL 8.0+ (InnoDB, UTF-8 mb4, Fulltext Indexing)
- **Безпека:** PDO Prepared Statements, BCRYPT Password Hashing, Bearer Token Auth, CORS Guard
- **Медіа:** Модуль валідації та завантаження фотографій на сервер
- **Інтеграції:** Telegram Bot API (сповіщення про замовлення через cURL)

---

## 🚀 Швидкий старт (3 кроки)

1. **Запустіть Apache та MySQL у XAMPP Control Panel.**
2. **Ініціалізуйте базу даних:**
   Відкрийте у браузері: `http://localhost/tabletop-shop/backend/setup.php`
3. **Запустіть клієнтський застосунок:**
   ```bash
   cd /Applications/XAMPP/xamppfiles/htdocs/tabletop-shop
   npm install
   npm run dev
   ```
   Перейдіть за посиланням: **http://localhost:5173**

---

## 🔑 Тестовий доступ до адміністративної панелі

- **URL:** [http://localhost:5173/adminLogin](http://localhost:5173/adminLogin)
- **Email:** `admin@tabletop.com`
- **Пароль:** `admin123`

