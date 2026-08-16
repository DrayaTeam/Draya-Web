import { test, expect } from '@playwright/test';
import { setupAdminAuth } from './helpers/auth.helper';

test.describe('Admin Module E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminAuth(page);
  });

  test('should render admin layout with sidebar, topbar, and profile', async ({ page }) => {
    await page.goto('/admin/dashboard');
    const sidebar = page.locator('aside.sidebar');
    await expect(sidebar).toBeVisible();

    const topbar = page.locator('header.topbar');
    await expect(topbar).toBeVisible();

    const profilePill = page.locator('.admin-profile-pill');
    await expect(profilePill).toBeVisible();
  });

  test('should display dashboard financial overview cards', async ({ page }) => {
    await page.goto('/admin/dashboard');
    const statCards = page.locator('draya-admin-stat-card');
    await expect(statCards.first()).toBeVisible();
    expect(await statCards.count()).toBeGreaterThanOrEqual(4);
  });

  test('should navigate to withdrawals and open detail slide-over', async ({ page }) => {
    await page.goto('/admin/withdrawals');
    await expect(page.locator('h1.page-title')).toContainText('السحوبات');

    const table = page.locator('draya-admin-data-table');
    await expect(table).toBeVisible();

    const viewBtn = page.locator('.view-btn').first();
    if (await viewBtn.isVisible()) {
      await viewBtn.click();
      const slideOver = page.locator('draya-admin-slide-over');
      await expect(slideOver).toBeVisible();
    }
  });

  test('should render adjustments page with form', async ({ page }) => {
    await page.goto('/admin/adjustments');
    await expect(page.locator('h1.page-title')).toContainText('تسوية');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('select#teacherId')).toBeVisible();
  });

  test('should render classroom types page and allow open modal', async ({ page }) => {
    await page.goto('/admin/classroom-types');
    await expect(page.locator('h1.page-title')).toContainText('أنواع الفصول');

    const addBtn = page.locator('.add-btn');
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    const modal = page.locator('.modal-card');
    await expect(modal).toBeVisible();
  });

  test('should render grade levels page', async ({ page }) => {
    await page.goto('/admin/grade-levels');
    await expect(page.locator('h1.page-title')).toContainText('المراحل الدراسية');
    await expect(page.locator('draya-admin-data-table')).toBeVisible();
  });

  test('should render supervisors page', async ({ page }) => {
    await page.goto('/admin/supervisors');
    await expect(page.locator('h1.page-title')).toContainText('المشرفون');
    await expect(page.locator('draya-admin-data-table')).toBeVisible();
  });

  test('should render platform settings page and inputs', async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page.locator('h1.page-title')).toContainText('إعدادات المنصة');
    await expect(page.locator('input#aiExamPrice')).toBeVisible();
    await expect(page.locator('input#commission')).toBeVisible();
  });
});
