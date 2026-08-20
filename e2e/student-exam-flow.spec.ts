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
    await expect(questionCard).toBeVisible();

    const options = page.locator('.option-item');
    if ((await options.count()) > 0) {
      await options.first().dispatchEvent('click');
    }

    // Question map sidebar
    const mapSidebar = page.locator('app-exam-question-map');
    await expect(mapSidebar).toBeVisible();

    // Next question navigation
    const nextBtn = page.locator('.next-btn');
    if ((await nextBtn.count()) > 0) {
      await nextBtn.dispatchEvent('click');
    }

    // Flag button toggle
    const flagBtn = page.locator('.flag-btn');
    if ((await flagBtn.count()) > 0) {
      await flagBtn.dispatchEvent('click');
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
