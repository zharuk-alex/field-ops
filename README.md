# Field Ops

**Field Ops** — Progressive Web Application для мобільних аудитів з адмін-панеллю для менеджменту. Система складається з трьох компонентів:

- **PWA** — мобільний клієнт для аудиторів з offline-first підходом
- **Admin SPA** — веб-панель для менеджерів та адміністраторів
- **Backend API** — REST API на Node.js з PostgreSQL

_Дипломний проєкт_

---

## Демо

- **PWA (аудитор)**: https://field-ops-ten.vercel.app/
- **Admin SPA**: https://field-ops-admin-rho.vercel.app/
- **Backend API**: https://field-ops.onrender.com
- **Репозиторій**: https://github.com/zharuk-alex/field-ops

### Тестові облікові записи

**PWA (аудитор)**:

- Email: `auditor@example.com`
- Password: `demo123`

**Admin панель**:

- Email: `admin@example.com`
- Password: `demo123`

---

## Технологічний стек

### Backend

- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT Authentication
- Cloudinary (зберігання фото)
- Joi (валідація)

### Frontend

- Vue.js 3 + Quasar Framework
- Vuex (state management)
- IndexedDB/Dexie.js (offline storage)
- Service Worker + Workbox (PWA)
- Web Workers (обробка фото)
- Vue Router
- Vue I18n (українська/англійська)

---

## Функціонал

### PWA

- Offline-first архітектура
- Створення та виконання аудитів без інтернету
- Різні типи питань (text, number, choice, photo, date)
- Фото з автоматичним стисненням та thumbnails
- Перевірка геолокації при старті/завершенні аудиту
- Автоматична синхронізація при появі з'єднання
- Retry механізм для фото з помилками
- SHA-1 дедуплікація фото

### Admin панель

- CRUD для компаній, локацій, шаблонів, питань
- Управління користувачами та ролями
- Перегляд та фільтрація аудитів
- Галерея фото з каруселлю
- Dashboard зі статистикою

---

## Швидкий старт

### Передумови

- Node.js >= 18
- PostgreSQL >= 14
- npm або yarn

### 1. Клонування репозиторію

```bash
git clone https://github.com/zharuk-alex/field-ops.git
cd field-ops
```

### 2. Налаштування Backend

```bash
cd backend
npm install
```

Створіть файл `.env` на основі `.env.example`:

```bash
cp ../.env.example .env
```

Відредагуйте `.env` та вкажіть параметри бази даних та сервісів:

```env
DATABASE_DIALECT=postgres
DATABASE_NAME=fieldops
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRES=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ADMIN_USER=admin@example.com
ADMIN_PASSWORD=admin123
```

Запустіть міграції:

```bash
npm run migrate
```

Запустіть сервер:

```bash
npm run dev
```

Backend буде доступний за адресою `http://localhost:3000`

### 3. Налаштування Frontend (PWA)

```bash
cd ../frontend
npm install
```

Створіть файл `.env` на основі `.env.example`:

```bash
cp .env.example .env
```

Відредагуйте `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_BUILD_TARGET=pwa
```

Запустіть PWA в режимі розробки:

```bash
npm run dev:pwa
```

PWA буде доступний за адресою `http://localhost:9000`

### 4. Налаштування Frontend (Admin)

У тій самій папці `frontend` запустіть admin панель:

```bash
npm run dev:admin
```

Admin панель буде доступна за адресою `http://localhost:9100`

---

## Структура проєкту

```
field-ops/
├── backend/              # Node.js REST API
│   ├── controllers/      # Контролери
│   ├── db/
│   │   ├── migrations/   # Міграції БД
│   │   └── models/       # Sequelize моделі
│   ├── routes/           # API маршрути
│   ├── services/         # Бізнес-логіка
│   ├── validators/       # Joi схеми валідації
│   └── constants/        # Константи
├── frontend/             # Vue.js + Quasar
│   ├── src/
│   │   ├── components/   # Vue компоненти
│   │   ├── pages/        # Сторінки (PWA та Admin)
│   │   ├── store/        # Vuex store
│   │   ├── router/       # Vue Router
│   │   ├── composable/   # Composables
│   │   └── workers/      # Web Workers
│   ├── src-pwa/          # PWA конфігурація
│   └── quasar.config.js  # Quasar налаштування
└── env/                  # Env файли для різних середовищ
```

---

## Скрипти

### Backend

```bash
npm run dev          # Запуск в dev режимі
npm run migrate      # Виконати міграції
npm run migrate:undo # Відкотити останню міграцію
npm start            # Запуск в production режимі
```

### Frontend

```bash
npm run dev:pwa      # PWA розробка (localhost:9000)
npm run dev:admin    # Admin розробка (localhost:9100)
npm run build:pwa    # Production build PWA
npm run build:admin  # Production build Admin
npm run lint         # ESLint перевірка
npm run format       # Prettier форматування
```

---

## Deployment

### Backend (Render.com)

1. Створіть PostgreSQL базу даних на Render
2. Створіть Web Service та підключіть GitHub репозиторій
3. Налаштуйте змінні оточення з `.env.example`
4. Build Command: `cd backend && npm install`
5. Start Command: `cd backend && npm start`

### Frontend PWA (Vercel)

1. Підключіть GitHub репозиторій до Vercel
2. Root Directory: `frontend`
3. Build Command: `npm run build:pwa`
4. Output Directory: `dist/pwa`
5. Налаштуйте змінні оточення

### Frontend Admin (Vercel)

1. Створіть окремий проєкт на Vercel
2. Root Directory: `frontend`
3. Build Command: `npm run build:admin`
4. Output Directory: `dist/admin`
5. Налаштуйте змінні оточення

---

## Особливості архітектури

### Offline-First PWA

- IndexedDB для локального зберігання аудитів та фото
- Service Worker кешує API запити та статику
- Автоматична синхронізація при відновленні з'єднання
- Двофазна синхронізація: спочатку структура аудиту, потім фото

### Обробка фото

- Web Worker з OffscreenCanvas для стиснення
- Fallback на main thread для старих браузерів
- Transferable Objects для zero-copy передачі ArrayBuffer
- Автоматична генерація thumbnails
- SHA-1 хеш для дедуплікації

### Геолокація

- Перевірка відстані від локації при старті/завершенні
- Збереження координат в метаданих аудиту
- Розрахунок відстані з відображенням в метрах/км

---

## Ліцензія

MIT

---

## Автор

Олександр Жарук
Email: zharuk.alex@gmail.com
GitHub: [@zharuk-alex](https://github.com/zharuk-alex)

---
