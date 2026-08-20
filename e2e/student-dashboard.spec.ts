import { test, expect } from '@playwright/test';

test.describe('Student Dashboard E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/student/dashboard');
  });

  test('should display dashboard greeting and header', async ({ page }) => {
    const mainTitle = page.locator('.hero-title, h1, .welcome-hero-card');
    await expect(mainTitle.first()).toBeVisible();
  });

  test('should render KPI statistics overview cards', async ({ page }) => {
    const kpiCards = page.locator('.welcome-hero-card, .streak-card, .stat-card');
    await expect(kpiCards.first()).toBeVisible();
  });

  test('should allow navigation to other student modules', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    const teachersLink = page.locator(
      'a[href*="/student/teachers"], button:has-text("المعلمين"), a:has-text("المعلمين")',
    );
    if ((await teachersLink.count()) > 0) {
      await page.waitForTimeout(300);
      await teachersLink.first().click({ force: true });
      await expect(page).toHaveURL(/.*\/student\/teachers/);
    }
  });
});
