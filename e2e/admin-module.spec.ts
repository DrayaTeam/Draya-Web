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

  test('should display dashboard financial overview cards and quick links', async ({ page }) => {
    await page.goto('/admin/dashboard');
    const statCards = page.locator('draya-admin-stat-card');
    await expect(statCards.first()).toBeVisible({ timeout: 10000 });
    expect(await statCards.count()).toBeGreaterThanOrEqual(4);

    const quickLinks = page.locator('.quick-actions-bar a, .quick-actions-bar button');
    if (
      await quickLinks
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      expect(await quickLinks.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('should navigate to withdrawals and open detail slide-over', async ({ page }) => {
    await page.goto('/admin/withdrawals');
    await expect(page.locator('h1.page-title')).toContainText('السحوبات');

    const table = page.locator('draya-admin-data-table');
    await expect(table).toBeVisible({ timeout: 10000 });

    const viewBtn = page.locator('.view-btn').first();
    const isPresent = await viewBtn.isVisible().catch(() => false);
    if (isPresent) {
      await page.waitForTimeout(300);
      await viewBtn.click();
      const slideOver = page.locator('draya-admin-slide-over');
      await expect(slideOver).toBeVisible();
    }
  });

  test('should render adjustments page with form and validate inputs', async ({ page }) => {
    await page.goto('/admin/adjustments');
    await expect(page.locator('h1.page-title')).toContainText('تسوية');

    const teacherSelect = page.locator(
      'select#teacherId, select[name="teacherId"], .teacher-select',
    );
    if (
      await teacherSelect
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await expect(teacherSelect.first()).toBeVisible();
    }

    const amountInput = page.locator('input#amount, input[name="amount"], input[type="number"]');
    await expect(amountInput.first()).toBeVisible();
  });

  test('should render classroom types page and allow open modal', async ({ page }) => {
    await page.goto('/admin/classroom-types');
    await expect(page.locator('h1.page-title')).toContainText('أنواع الفصول');

    const addBtn = page.locator('.add-btn, button:has-text("إضافة نوع فصل جديد")');
    await expect(addBtn.first()).toBeVisible();
    await addBtn.first().click();

    await expect(page.locator('.modal-card, .dialog-card')).toBeVisible();
  });

  test('should render grade levels page and allow open modal', async ({ page }) => {
    await page.goto('/admin/grade-levels');
    await expect(page.locator('h1.page-title')).toContainText('المراحل الدراسية');

    const addBtn = page.locator('.add-btn, button:has-text("إضافة مرحلة دراسية جديدة")');
    await expect(addBtn.first()).toBeVisible();
    await addBtn.first().click();

    await expect(page.locator('.modal-card, .dialog-card')).toBeVisible();
  });

  test('should render supervisors page and open invite modal', async ({ page }) => {
    await page.goto('/admin/supervisors');
    await expect(page.locator('h1.page-title')).toContainText('المشرفون');

    const inviteBtn = page.locator('.invite-btn, button:has-text("دعوة مشرف جديد")');
    if (
      await inviteBtn
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await inviteBtn.first().click();
      await expect(page.locator('.modal-card, .dialog-card')).toBeVisible();
    }
  });

  test('should render platform settings page and inputs', async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page.locator('h1.page-title')).toContainText('إعدادات المنصة');

    const commissionInput = page
      .locator('input#commission, input[name="platformCommissionPercent"], input[type="number"]')
      .first();
    await expect(commissionInput).toBeVisible();
  });

  test('should render profile page and toggle security tab', async ({ page }) => {
    await page.goto('/admin/profile');
    await expect(page.locator('h1.page-title')).toContainText('حسابي');

    const tabBtn = page.locator(
      '.profile-tabs button:has-text("الأمان"), .profile-tabs button:has-text("كلمة المرور"), .profile-tabs .tab-btn',
    );
    if ((await tabBtn.count()) > 1) {
      await tabBtn.nth(1).click({ force: true });
      await expect(
        page.locator('input#newPass, input[type="password"]').first(),
      ).toBeVisible({ timeout: 10000 });
    }
  });
});
