# field-ops

**field-ops** — PWA-клієнт для мобільних аудитів (auditor) та Admin SPA для менеджменту (manager / admin). Бекенд — REST API на Node.js з PostgreSQL.  
_Це дипломний проєкт — робоча назва `field-ops`._

---

## Live

- PWA (клієнт): https://field-ops-ten.vercel.app/
- Admin SPA: https://field-ops-admin-rho.vercel.app/
- Backend API: https://field-ops.onrender.com
- Репозиторій: https://github.com/zharuk-alex/field-ops

## Швидкий старт (локально)

> Перед запуском створіть файл `.env.local` у папці `env/` в корені проекту.

Приклад .env

```
DATABASE_DIALECT=
DATABASE_NAME=
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USERNAME=
DATABASE_PASSWORD=
JWT_SECRET=
JWT_EXPIRES=
```

### Backend

```bash
cd backend
npm install
npm run dev:local
```

### Frontend PWA

```bash
cd frontend
npm install
npm run dev:pwa
```

### Frontend SPA (admin)

```bash
cd frontend
npm run dev:admin
```
