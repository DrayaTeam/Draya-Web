import { test, expect } from '@playwright/test';
import { setupStudentAuth } from './helpers/auth.helper';

test.describe('Student Dashboard E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupStudentAuth(page);
    await page.route('**/api/v1/students/dashboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          studentName: 'أحمد علي',
          completedExamsCount: 5,
          overallAveragePercentage: 88,
          weeklyStudyStreakDays: 4,
          enrolledCourses: [],
          upcomingDeadlines: [],
        }),
      });
    });
    await page.goto('/student/dashboard');
  });

  test('should display dashboard greeting and header', async ({ page }) => {
    const mainTitle = page.locator('.hero-title, h1, .welcome-hero-card');
    await expect(mainTitle.first()).toBeVisible();
  });

  test('should render KPI statistics overview cards', async ({ page }) => {
    const kpiCards = page.locator(
      '.welcome-hero-card, .streak-card, .stat-card, app-report-kpi-card, .dashboard-container, .student-dashboard-root',
    );
    await expect(kpiCards.first()).toBeVisible({ timeout: 15000 });
  });

  test('should allow navigation to other student modules', async ({ page }) => {
    await page.goto('/student/teachers');
    await expect(page).toHaveURL(/.*\/student\/teachers/);
  });
});
