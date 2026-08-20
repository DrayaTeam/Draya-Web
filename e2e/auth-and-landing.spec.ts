import { test, expect } from '@playwright/test';

test.describe('Landing & Authentication E2E Flow', () => {
  // Use clean unauthenticated storage for guest flows
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should load landing page with branding and CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/درايَة|Draya/);

    const brandElement = page.locator('nav, header');
    await expect(brandElement.first()).toBeVisible();
  });

  test('should navigate to login page and render login form', async ({ page }) => {
    await page.goto('/auth/login');

    const emailInput = page.locator(
      'input[type="email"], input[formcontrolname="email"], input[name="email"]',
    );
    const passwordInput = page.locator(
      'input[type="password"], input[formcontrolname="password"], input[name="password"]',
    );

    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
  });

  test('should disable submit button when form is empty or invalid', async ({ page }) => {
    await page.goto('/auth/login');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn.first()).toBeDisabled();
  });
});
