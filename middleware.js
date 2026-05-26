import { next } from '@vercel/functions';

const PASSWORD_HASH_ENV = 'LANDING_PASSWORD_HASH';
const SESSION_SECRET_ENV = 'LANDING_SESSION_SECRET';
const SESSION_COOKIE = 'landing_auth';
const LOGIN_PATH = '/api/login';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const encoder = new TextEncoder();

export const config = {
  matcher: '/((?!api/|favicon.ico|robots.txt|sitemap.xml).*)',
};

export default async function middleware(request) {
  const url = new URL(request.url);

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return next();
  }

  const expectedHash = getExpectedPasswordHash();
  if (!expectedHash) {
    return loginPage({
      status: 500,
      message: 'Пароль на сервері не налаштований.',
      nextUrl: cleanNextUrl(url),
    });
  }

  const token = getCookie(request.headers.get('cookie') || '', SESSION_COOKIE);
  if (token && await verifySessionToken(token, expectedHash)) {
    const response = next();
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }

  return loginPage({
    message: getLoginMessage(url.searchParams.get('login')),
    nextUrl: cleanNextUrl(url),
  });
}

function loginPage({ status = 200, message = '', nextUrl = '/' } = {}) {
  const safeNextUrl = normalizeRedirect(nextUrl) || '/';
  const formAction = `${LOGIN_PATH}?${new URLSearchParams({ next: safeNextUrl })}`;
  const errorMarkup = message
    ? `<p class="error" role="alert">${escapeHtml(message)}</p>`
    : '<p class="error" role="alert"></p>';

  return new Response(`<!doctype html>
<html lang="uk">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Вхід</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f7f8fb;
        color: #172033;
      }

      * {
        box-sizing: border-box;
      }

      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 24px;
        background: #f7f8fb;
      }

      main {
        width: min(100%, 360px);
        padding: 24px;
        border: 1px solid #d9dfeb;
        border-radius: 8px;
        background: #ffffff;
        box-shadow: 0 18px 54px rgba(23, 32, 51, 0.12);
      }

      h1 {
        margin: 0 0 18px;
        font-size: 24px;
        line-height: 1.2;
        letter-spacing: 0;
      }

      form {
        display: grid;
        gap: 12px;
      }

      label {
        font-size: 14px;
        font-weight: 650;
        color: #5d6a80;
      }

      input {
        width: 100%;
        min-height: 46px;
        border: 1px solid #d9dfeb;
        border-radius: 6px;
        padding: 0 12px;
        font: inherit;
        color: #172033;
        background: #ffffff;
        outline: none;
      }

      input:focus {
        border-color: #172033;
        box-shadow: 0 0 0 3px rgba(23, 32, 51, 0.12);
      }

      button {
        min-height: 46px;
        border: 0;
        border-radius: 6px;
        font: inherit;
        font-weight: 700;
        color: #ffffff;
        background: #172033;
        cursor: pointer;
      }

      button:hover,
      button:focus-visible {
        background: #26324a;
      }

      .error {
        min-height: 18px;
        margin: 0;
        font-size: 14px;
        color: #b42318;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Введіть пароль</h1>
      <form method="post" action="${escapeHtml(formAction)}">
        <label for="password">Пароль</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
        <button type="submit">Увійти</button>
        ${errorMarkup}
      </form>
    </main>
  </body>
</html>`, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function getExpectedPasswordHash() {
  const value = process.env[PASSWORD_HASH_ENV] || '';
  return /^[a-f0-9]{64}$/i.test(value) ? value.toLowerCase() : '';
}

async function createSessionToken(expectedHash) {
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const signature = await sign(`${issuedAt}.${expectedHash}`, expectedHash);
  return `${issuedAt}.${signature}`;
}

async function verifySessionToken(token, expectedHash) {
  const [issuedAt, signature, extra] = token.split('.');
  const timestamp = Number(issuedAt);
  const now = Math.floor(Date.now() / 1000);

  if (extra || !issuedAt || !signature || !Number.isInteger(timestamp)) {
    return false;
  }

  if (timestamp > now || now - timestamp > SESSION_MAX_AGE_SECONDS) {
    return false;
  }

  const expectedSignature = await sign(`${issuedAt}.${expectedHash}`, expectedHash);
  return constantTimeEqual(signature, expectedSignature);
}

async function sign(value, expectedHash) {
  const secret = process.env[SESSION_SECRET_ENV] || expectedHash;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toHex(signature);
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function getCookie(header, name) {
  return header
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.slice(name.length + 1) || '';
}

function constantTimeEqual(a, b) {
  if (!a || !b || a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

function normalizeRedirect(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '';
  }

  return value;
}

function cleanNextUrl(url) {
  const cleanUrl = new URL(url);
  cleanUrl.searchParams.delete('login');
  return cleanUrl.pathname + cleanUrl.search;
}

function getLoginMessage(reason) {
  if (reason === 'password') {
    return 'Невірний пароль';
  }

  if (reason === 'server') {
    return 'Пароль на сервері не налаштований.';
  }

  return '';
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
