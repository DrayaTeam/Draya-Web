import { Page } from '@playwright/test';

export function generateStudentToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'demo-student-1',
      email: 'student@draya.com',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Student',
      fullName: 'أحمد علي',
      iat: 1700000000,
      exp: 2534060800,
      jti: 'demo-jti-token',
    }),
  ).toString('base64url');
  return `${header}.${payload}.dummy_signature`;
}

export async function setupStudentAuth(page: Page): Promise<void> {
  const token = generateStudentToken();
  const user = JSON.stringify({
    userId: 'demo-student-1',
    email: 'student@draya.com',
    fullName: 'أحمد علي',
    role: 'student',
  });

  await page.addInitScript(
    ({ t, u }) => {
      try {
        window.localStorage.setItem('draya_access_token', t);
        window.localStorage.setItem('draya_user', u);
      } catch {
        // ignore
      }
    },
    { t: token, u: user },
  );
}

export function generateAdminToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'demo-admin-1',
      email: 'admin@draya.com',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Admin',
      fullName: 'أ. عبدالرحمن العنزي',
      iat: 1700000000,
      exp: 2534060800,
      jti: 'demo-jti-token-admin',
    }),
  ).toString('base64url');
  return `${header}.${payload}.dummy_signature`;
}

export async function setupAdminAuth(page: Page): Promise<void> {
  const token = generateAdminToken();
  const user = JSON.stringify({
    userId: 'demo-admin-1',
    email: 'admin@draya.com',
    fullName: 'أ. عبدالرحمن العنزي',
    role: 'Admin',
  });

  await page.addInitScript(
    ({ t, u }) => {
      try {
        window.localStorage.setItem('draya_access_token', t);
        window.localStorage.setItem('draya_user', u);
      } catch {
        // ignore
      }
    },
    { t: token, u: user },
  );
}
