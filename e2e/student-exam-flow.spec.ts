import { test, expect } from '@playwright/test';
import { setupStudentAuth } from './helpers/auth.helper';

test.describe('Student Live Exam Taking & Result Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupStudentAuth(page);
  });

  test('should render exam taking page, timer, and question navigation', async ({ page }) => {
    await page.goto('/student/exams/exam-1/take');

    // Title and countdown timer
    const title = page.locator('.exam-title');
    await expect(title).toBeVisible({ timeout: 10000 });

    const timer = page.locator('.timer-countdown');
    await expect(timer).toBeVisible();

    // Question card and options
    const questionCard = page.locator('app-exam-question-card');
    await expect(questionCard).toBeVisible({ timeout: 10000 });

    const firstOption = page.locator('.option-item').first();
    await expect(firstOption).toBeVisible({ timeout: 10000 });
    await firstOption.click();

    // Question map sidebar
    const mapSidebar = page.locator('app-exam-question-map');
    await expect(mapSidebar).toBeVisible();

    // Flag button toggle
    const flagBtn = page.locator('.flag-btn, button:has-text("مراجعة لاحقاً")').first();
    if (await flagBtn.isVisible().catch(() => false)) {
      await flagBtn.click();
    }
  });

  test('should display exam results report, score, and review items', async ({ page }) => {
    await page.goto('/student/exams/exam-1/result?score=85');

    const resultCard = page.locator('app-exam-result-card');
    await expect(resultCard).toBeVisible({ timeout: 10000 });

    const mainTitle = page.locator('.main-title');
    await expect(mainTitle).toContainText('تقرير تحليل نتيجة الامتحان');

    const reviewCards = page.locator('app-exam-question-review-card');
    await expect(reviewCards.first()).toBeVisible();
  });
});
