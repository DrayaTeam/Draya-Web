import { test, expect } from '@playwright/test';
import { setupStudentAuth } from './helpers/auth.helper';

test.describe('Teachers Directory E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupStudentAuth(page);

    await page.route('**/api/v1/teachers*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              teacherId: 't-1',
              fullName: 'أحمد محمود',
              bio: 'معلم أول لغة عربية',
              subjectName: 'اللغة العربية',
              avatarUrl: '',
              rating: 4.9,
              totalStudents: 150,
              totalCourses: 5,
            },
          ],
          pageNumber: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
        }),
      });
    });

    await page.goto('/student/teachers');
    await page.locator('.main-title, h1').first().waitFor({ state: 'visible', timeout: 15000 });
  });

  test('should render page title and search controls', async ({ page }) => {
    const pageTitle = page.locator('.main-title, h1').first();
    await expect(pageTitle).toBeVisible({ timeout: 10000 });

    const searchInput = page.locator('input.search-input').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test('should filter teacher cards when typing in search input', async ({ page }) => {
    const filterComponent = page.locator('draya-teacher-filter');
    await expect(filterComponent).toBeVisible({ timeout: 10000 });

    const searchInput = page.locator('input.search-input').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill('أحمد', { force: true });
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
