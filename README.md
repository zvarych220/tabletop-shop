# 🎲 Dice & Deck - Інтернет-магазин та клуб настільних ігор

Повнофункціональний вебзастосунок інтернет-магазину та клубу настільних ігор **«Dice & Deck»**. Клієнтська частина реалізована як Single Page Application на базі **React 19 + Vite 6**, а серверна частина — у вигляді повноцінного **RESTful API на PHP 8.1+ з базою даних MySQL** та інтеграцією з **Telegram Bot API**.

---

## ✨ Основні можливості

### Для відвідувачів та покупців
- 🎯 **Інтерактивний каталог:** швидкий пошук, фільтрація за жанром/категорією, діапазоном цін, кількістю гравців та наявністю на складі.
- 📦 **Детальна сторінка товару:** повний опис, комплектація, динамічний рейтинг, блок відгуків реальних гравців та форма подання власного відгуку.
- 🛒 **Кошик (Slide-over Cart):** додавання ігор, зміна кількості в один клік, збереження стану в `localStorage`, розрахунок підсумкової суми.
- 📝 **Оформлення замовлень:** вибір доставки («Нова Пошта», «Укрпошта»), міста, відділення, способу оплати та прив'язка Telegram Chat ID для сповіщень.
- ❤️ **Список обраного (Favorites):** додавання ігор у вибране з синхронізацією з базою даних.
- 🔐 **Аутентифікація та кабінет:** реєстрація, авторизація через Bearer-токени, профіль користувача з історією замовлень.

### Для адміністраторів та менеджерів (`/admin`)
- 📦 **Керування товарами:** CRUD операції, залишки на складі, ціни, знижки, пряме завантаження зображень з комп'ютера.
- 📋 **Керування замовленнями:** перегляд повного складу замовлень, зміна статусів обробки (`pending` → `processing` → `completed` / `cancelled`).
- 🛡️ **Модерація відгуків:** попередня перевірка та схвалення/відхилення відгуків з автоматичним перерахунком рейтингу ігор.
- 👥 **Керування користувачами:** перегляд зареєстрованої бази, зміна ролей (`user`, `manager`, `admin`).
- 📈 **Аналітика та звіти:** виручка, динаміка доходів за місяцями, топ популярних ігор, воронка замовлень.
- 🤖 **Інтеграція Telegram Bot:** налаштування токена бота та Chat ID через інтерфейс, автоматичні сповіщення в месенджер, кнопка тестової перевірки.

---

## 🛠 Технологічний стек

- **Клієнт:** React 19, React Router v7, React Context API, Clean CSS Variables.
- **Сервер:** PHP 8.1+ (RESTful API, MVC, PDO, BCRYPT, cURL, FileUpload).
- **База даних:** MySQL 8.0+ (InnoDB, UTF-8 mb4, Fulltext Index).
- **Зовнішні сервіси:** Telegram Bot API.

---

## 🚀 Швидкий старт

### 1. Запустіть веб-сервер та MySQL у XAMPP
Увімкніть модулі **Apache** та **MySQL** у XAMPP Control Panel.

### 2. Ініціалізуйте базу даних
Відкрийте у браузері:
```
http://localhost/tabletop-shop/backend/setup.php
```

### 3. Запустіть фронтенд
```bash
npm install
npm run dev
```

Відкрийте в браузері: **http://localhost:5173**

---

## 🔑 Тестовий доступ

- **Адміністратор:** `admin@tabletop.com` / `admin123`
- **Користувач:** `taras.shevchenko@example.com` / `password123`

---

## 📖 Повна документація проєкту

Вся детальна документація систематизована у папці [`docs/`](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/README.md):

- [docs/README.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/README.md) — Головний зміст та навігатор по документації;
- [docs/project-plan.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/project-plan.md) — Специфікація системи, модель сутностей, Use Cases та Roadmap;
- [docs/component-architecture.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/component-architecture.md) — Компонентна архітектура React, Context Providers, хуки, валідація;
- [docs/api-reference.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/api-reference.md) — Повний довідник серверного REST API;
- [docs/database-schema.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/database-schema.md) — Схема реляційної БД MySQL, індекси, ключі та ER-діаграма;
- [docs/telegram-integration.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/telegram-integration.md) — Інтеграція та налаштування Telegram-бота;
- [docs/deployment-guide.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/deployment-guide.md) — Покроковий посібник із розгортання та усунення проблем;
- [docs/admin-manual.md](file:///Applications/XAMPP/xamppfiles/htdocs/tabletop-shop/docs/admin-manual.md) — Посібник користувача панелі адміністратора.
