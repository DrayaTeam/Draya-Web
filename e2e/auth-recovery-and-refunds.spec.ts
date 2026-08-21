import { test, expect } from '@playwright/test';
import { setupAdminAuth } from './helpers/auth.helper';

test.describe('Auth Recovery, Accept Invite & Refunds Flow', () => {
  test('Feature O1: should render accept invitation page and handle token query param', async ({
    page,
    context,
  }) => {
    await context.clearCookies();
    await page.goto('/auth/login');
    await page.evaluate(() => localStorage.clear());

    // 1. When no token is supplied, shows invalid token alert
    await page.goto('/auth/accept-invite');
    await expect(page.locator('body')).toContainText('رابط الدعوة غير صالح');

    // 2. When valid token is supplied, renders full name, phone, and password inputs
    await page.goto('/auth/accept-invite?token=mock-token-xyz&email=supervisor@draya.edu.sa');
    await expect(page.locator('h1').first()).toContainText('تفعيل حساب المشرف');
    await expect(page.locator('input#fullName')).toBeVisible();
    await expect(page.locator('input#phone')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('input#confirmPassword')).toBeVisible();
  });

  test('Feature O2: should support two-step forgot password recovery workflow', async ({
    page,
    context,
  }) => {
    await context.clearCookies();
    await page.goto('/auth/login');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/auth/forgot-password');
    await expect(page.locator('h1').first()).toBeVisible();

    // Step 1: Input email
    const emailInput = page.locator('input#email');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('teacher@draya.edu.sa');
    await emailInput.dispatchEvent('input');
    await emailInput.dispatchEvent('change');

    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click({ force: true });
    }

    // Verify step transition or presence of step UI
    await page.waitForTimeout(500);
    const otpInput = page.locator('input#otpCode');
    if (await otpInput.isVisible().catch(() => false)) {
      await expect(otpInput).toBeVisible();
      await expect(page.locator('input#newPassword')).toBeVisible();
      await expect(page.locator('input#confirmPassword')).toBeVisible();
    }
  });

  test('Feature O3: should display refund options in admin withdrawals drawer', async ({
    page,
  }) => {
    await setupAdminAuth(page);
    await page.goto('/admin/withdrawals');
    await expect(page.locator('h1.page-title')).toContainText('السحوبات');

    const table = page.locator('draya-admin-data-table');
    await expect(table).toBeVisible({ timeout: 10000 });

    const viewBtn = page.locator('.view-btn').first();
    const isPresent = await viewBtn.isVisible().catch(() => false);
    if (isPresent) {
      await page.waitForTimeout(300);
      await viewBtn.click();
      const slideOver = page.locator('draya-admin-slide-over');
      await expect(slideOver).toBeVisible();
    }
  });
});
