import crypto from 'node:crypto';

const PASSWORD_HASH_ENV = 'LANDING_PASSWORD_HASH';
const SESSION_SECRET_ENV = 'LANDING_SESSION_SECRET';
const SESSION_COOKIE = 'landing_auth';
const CLIENT_COOKIE = 'landing_client_unlocked';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).send('Method Not Allowed');
    return;
  }

  const expectedHash = getExpectedPasswordHash();
  const nextUrl = normalizeRedirect(request.query?.next) || '/';

  if (!expectedHash) {
    redirectWithError(response, nextUrl, 'server');
    return;
  }

  const password = await readPassword(request);
  const submittedHash = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');

  if (!constantTimeEqual(submittedHash, expectedHash)) {
    redirectWithError(response, nextUrl, 'password');
    return;
  }

  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHmac('sha256', process.env[SESSION_SECRET_ENV] || expectedHash)
    .update(`${issuedAt}.${expectedHash}`)
    .digest('hex');
  const secure = isHttps(request) ? '; Secure' : '';

  response.setHeader('Set-Cookie', [
    `${SESSION_COOKIE}=${issuedAt}.${signature}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax; HttpOnly${secure}`,
    `${CLIENT_COOKIE}=1; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax${secure}`,
  ]);
  response.writeHead(303, {
    Location: nextUrl,
    'Cache-Control': 'no-store',
  });
  response.end();
}

async function readPassword(request) {
  if (request.body && typeof request.body === 'object') {
    return request.body.password || '';
  }

  const body = typeof request.body === 'string'
    ? request.body
    : await readStream(request);

  return new URLSearchParams(body).get('password') || '';
}

function readStream(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function redirectWithError(response, nextUrl, reason) {
  response.writeHead(303, {
    Location: addLoginReason(nextUrl, reason),
    'Cache-Control': 'no-store',
  });
  response.end();
}

function getExpectedPasswordHash() {
  const value = process.env[PASSWORD_HASH_ENV] || '';
  return /^[a-f0-9]{64}$/i.test(value) ? value.toLowerCase() : '';
}

function normalizeRedirect(value) {
  const nextUrl = Array.isArray(value) ? value[0] : value;

  if (!nextUrl || !nextUrl.startsWith('/') || nextUrl.startsWith('//')) {
    return '';
  }

  return nextUrl;
}

function isHttps(request) {
  return request.headers['x-forwarded-proto'] === 'https';
}

function addLoginReason(nextUrl, reason) {
  const url = new URL(nextUrl, 'https://landing.local');
  url.searchParams.set('login', reason);
  return url.pathname + url.search;
}

function constantTimeEqual(a, b) {
  if (!a || !b || a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
