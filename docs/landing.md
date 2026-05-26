# Документація лендінгу

Останнє оновлення: 26 травня 2026

## Що це

Це простий статичний лендінг з одним основним текстом:

```text
Хелло Ворлд
```

Сайт не використовує React, Next.js, Vite, бекенд, базу даних або API. Увесь лендінг знаходиться в одному HTML-файлі.

## Де лежить локально

Папка проєкту:

```text
/Users/vladapodkuyko/Documents/New project
```

Головний файл сторінки:

```text
/Users/vladapodkuyko/Documents/New project/index.html
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

Для цього лендінгу environment variables не використовуються. Причина проста: сторінка статична і не має API-ключів, бази даних або окремих тестових/бойових налаштувань.

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

Найпростіший спосіб: відкрити `index.html` у браузері.

Або запустити локальний перегляд з папки проєкту:

```bash
python3 -m http.server 8000
```

Потім відкрити:

```text
http://localhost:8000/
```

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
