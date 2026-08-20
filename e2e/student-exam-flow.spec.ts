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
    await expect(mapSidebar).toBeVisible({ timeout: 10000 });

    // Flag button toggle
    const flagBtn = page.locator('.flag-btn, button:has-text("مراجعة لاحقاً")').first();
    if (await flagBtn.count() > 0) {
      await flagBtn.click({ force: true, timeout: 2000 }).catch(() => void 0);
    }
  });

  test('should render textbox and accept typing when question is Essay', async ({ page }) => {
    // Intercept student exam endpoint with an essay question
    await page.route('**/api/v1/students/exams/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'essay-exam-1',
          title: 'امتحان مقالي في هندسة البرمجيات',
          topic: 'RxJS and Angular',
          questions: [
            {
              id: 'q-essay-1',
              text: 'Describe how RxJS operators help avoid callback hell in asynchronous code.',
              type: 'Essay',
              difficulty: 'Medium',
              options: [],
            },
          ],
        }),
      });
    });

    await page.goto('/student/exams/essay-exam-1/take');

    const textarea = page.locator('textarea.essay-textarea, textarea#essay-answer-textarea');
    await expect(textarea).toBeVisible({ timeout: 10000 });
    await textarea.fill('RxJS operators like mergeMap, concatMap and switchMap flatten inner observables...');
    await expect(textarea).toHaveValue('RxJS operators like mergeMap, concatMap and switchMap flatten inner observables...');

    // Verify character count updates
    const charCount = page.locator('.char-count');
    await expect(charCount).toBeVisible();
    await expect(charCount).toContainText('حرف');
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
