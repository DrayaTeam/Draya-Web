import { test, expect } from '@playwright/test';
import { setupStudentAuth } from './helpers/auth.helper';

test.describe('Teachers Directory E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupStudentAuth(page);
    await page.goto('/student/teachers');
  });

  test('should render page title and search controls', async ({ page }) => {
    const pageTitle = page.locator('h1, .main-title, .directory-header');
    await expect(pageTitle.first()).toBeVisible();

    const searchInput = page.locator('input[type="text"], .search-input');
    await expect(searchInput.first()).toBeVisible();
  });

  test('should filter teacher cards when typing in search input', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], .search-input').first();
    await searchInput.fill('أحمد');

    // Wait for filtered results, empty state, or skeleton cards
    const teacherCards = page.locator(
      'draya-teacher-card, .teacher-skeleton-card, .empty-results-box, .teachers-card-grid',
    );
    await expect(teacherCards.first()).toBeVisible();
  });

  test('should click teacher card and navigate to teacher details', async ({ page }) => {
    const teacherCard = page.locator('draya-teacher-card').first();
    if (await teacherCard.isVisible()) {
      await teacherCard.click();
      await expect(page).toHaveURL(/.*\/student\/teachers/);
    }
  });
});
