import { test, expect } from '@playwright/test';
import { setupStudentAuth } from './helpers/auth.helper';

test.describe('Student Package Details & Feedback E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupStudentAuth(page);

    // Mock classroom package details API
    await page.route('**/api/v1/classrooms/pkg_1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          classroomId: 'pkg_1',
          name: 'باقة الفيزياء الشاملة - الثانوية العامة',
          teacherName: 'أ. محمد أحمد',
          subjectName: 'الفيزياء',
          price: 350,
          isActive: true,
          studentCount: 120,
        }),
      });
    });

    await page.route('**/api/v1/classrooms/pkg_1/materials*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      });
    });

    await page.route('**/api/v1/classrooms/pkg_1/sections*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      });
    });

    await page.route('**/api/v1/exams*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      });
    });

    // Mock classroom feedback API
    await page.route('**/api/v1/classrooms/pkg_1/feedback*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          averageRating: 4.9,
          totalCount: 15,
          items: [
            {
              feedbackId: 'fb-101',
              studentName: 'سارة عبد الله',
              rating: 5,
              comment: 'شرح أسطوري ومبسط جداً ومذكرات ممتازة!',
              createdAt: new Date().toISOString(),
            },
          ],
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }),
      });
    });

    await page.goto('/student/packages/pkg_1');
    await page.locator('.pkg-title').waitFor({ state: 'visible', timeout: 15000 });
  });

  test('should render package hero info and pricing', async ({ page }) => {
    const title = page.locator('.pkg-title');
    await expect(title).toBeVisible();

    const pricing = page.locator('.hero-pricing-box');
    await expect(pricing).toBeVisible();
  });

  test('should toggle tabs and display feedback reviews and rating stars', async ({ page }) => {
    const feedbackTab = page.locator('.pkg-tab-btn').filter({ hasText: 'التقييمات' }).first();
    await expect(feedbackTab).toBeVisible();
    await feedbackTab.click({ force: true });

    // Verify feedback summary card is visible
    const scoreCard = page.locator('.feedback-summary-card');
    await expect(scoreCard).toBeVisible({ timeout: 10000 });

    // Verify reviews feed shows student reviews
    const reviewCard = page.locator('.review-card').first();
    await expect(reviewCard).toBeVisible();
  });
});
