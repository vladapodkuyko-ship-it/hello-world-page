# Документація лендінгу

Останнє оновлення: 26 травня 2026

## Що це

Це простий лендінг з одним основним текстом:

```text
Хелло Ворлд
```

Сайт не використовує React, Next.js, Vite, бекенд або базу даних. Основний лендінг знаходиться в одному HTML-файлі. Для Vercel додано `middleware.js`, який показує сторінку входу до того, як Vercel віддасть `index.html`, та `api/login.js`, який перевіряє пароль і ставить cookie-сесію.

## Де лежить локально

Папка проєкту:

```text
/Users/vladapodkuyko/Documents/New project
```

Головний файл сторінки:

```text
/Users/vladapodkuyko/Documents/New project/index.html
```

Vercel-перевірка пароля:

```text
/Users/vladapodkuyko/Documents/New project/middleware.js
```

Обробка форми входу:

```text
/Users/vladapodkuyko/Documents/New project/api/login.js
```

Документація:

```text
/Users/vladapodkuyko/Documents/New project/docs/landing.md
```

## Де лежить у GitHub

Репозиторій:

```text
https://github.com/vladapodkuyko-ship-it/hello-world-page
```

Основна гілка:

```text
main
```

## Де сайт опублікований

GitHub Pages:

```text
https://vladapodkuyko-ship-it.github.io/hello-world-page/
```

Vercel Production:

```text
https://hello-world-page-peach.vercel.app/
```

## Як зроблений хостинг

### GitHub Pages

GitHub Pages бере файл `index.html` з кореня репозиторію у гілці `main`.

Налаштування:

```text
Branch: main
Path: /
```

Після push у GitHub Pages сторінка оновлюється автоматично.

### Vercel

Vercel-проєкт:

```text
hello-world-page
```

Vercel environment:

```text
Production
```

Поточний production alias:

```text
https://hello-world-page-peach.vercel.app/
```

Для доступу за паролем Vercel використовує environment variables:

```text
LANDING_PASSWORD_HASH
LANDING_SESSION_SECRET
```

У GitHub пароль не зберігається відкритим текстом. У Vercel треба зберігати хеш пароля та секрет для cookie-сесії.

Важливо: автоматичний GitHub to Vercel deploy ще не підключений, бо у Vercel-акаунті треба додати GitHub як login connection. Поточний Vercel deploy був зроблений вручну через Vercel CLI.

## Як змінити текст

Відкрити файл:

```text
/Users/vladapodkuyko/Documents/New project/index.html
```

Знайти рядок:

```html
<h1>Хелло Ворлд</h1>
```

Замінити текст всередині `h1` на потрібний.

## Як перевірити локально

Найпростіший спосіб: відкрити `index.html` у браузері. У цьому режимі працює клієнтська форма пароля.

Або запустити локальний перегляд з папки проєкту:

```bash
python3 -m http.server 8000
```

Потім відкрити:

```text
http://localhost:8000/
```

Важливо: локальна форма в `index.html` та GitHub Pages не є повноцінним захистом, бо браузер уже завантажує HTML-файл. Повноцінну перевірку до видачі сторінки робить Vercel через `middleware.js`.

## Як оновити GitHub

Після змін у файлах:

```bash
git add .
git commit -m "Update landing"
git push
```

Після `git push` GitHub Pages має оновити сайт автоматично.

## Як оновити Vercel Production

З папки проєкту:

```bash
npx --yes vercel@latest deploy --prod --yes
```

Ця команда створює новий production deployment у Vercel.

## Що ігнорується в Git

Файл `.gitignore` містить:

```text
.DS_Store
.vercel
```

`.vercel` не треба пушити в GitHub, бо це локальні службові дані прив'язки до Vercel-проєкту.
