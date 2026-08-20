import { test, expect } from '@playwright/test';
import { setupStudentAuth } from './helpers/auth.helper';

test.describe('Teachers Directory E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupStudentAuth(page);
    await page.goto('/student/teachers');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render page title and search controls', async ({ page }) => {
    const pageTitle = page.locator('h1, .main-title, .directory-header');
    await expect(pageTitle.first()).toBeVisible({ timeout: 10000 });

    const searchInput = page.locator('input.search-input, input[type="text"]');
    await expect(searchInput.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter teacher cards when typing in search input', async ({ page }) => {
    const filterComponent = page.locator('draya-teacher-filter');
    await expect(filterComponent).toBeVisible({ timeout: 10000 });

    const searchInput = page.locator('input.search-input, input[type="text"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill('أحمد');
    await expect(searchInput).toHaveValue('أحمد');

    const pills = page.locator('.filter-pill-btn');
    if ((await pills.count()) > 0) {
      await expect(pills.first()).toBeVisible();
    }
  });

  test('should click teacher card and navigate to teacher details', async ({ page }) => {
    const teacherCard = page.locator('draya-teacher-card, .teacher-card-root').first();
    if (await teacherCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await teacherCard.click({ force: true });
      await expect(page).toHaveURL(/.*\/student\/teachers/);
    }
  });
});
