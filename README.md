# Верстак

Тренажёр SQL в браузере: уроки с проверкой на скрытых данных, подсказки по схеме и пошаговый разбор SELECT. База — SQLite (sql.js). Уроки и базы лежат в `content/`. Отметка «решено» пишется в localStorage (`verstak-progress`). Как добавить урок — в `CONTRIBUTING.md`.

```bash
npm install
npm run dev
```

Проверка: `npm test`. Сборка: `npm run build`.

## GitHub

CI (`.github/workflows/ci.yml`) на пуше и pull request гоняет тесты, линтер и сборку.

Сайт собирает `.github/workflows/pages.yml`. В репозитории: **Settings → Pages → Source: GitHub Actions**. После пуша в `main` или `master` адрес будет `https://<владелец>.github.io/<репозиторий>/`. Если репозиторий называется `<владелец>.github.io`, сайт встанет в корень домена.

Локально так же, как на Pages:

```bash
BASE_PATH=/sqlTrain/ npm run build
npm run preview
```

В PowerShell: `$env:BASE_PATH="/sqlTrain/"; npm run build`.
