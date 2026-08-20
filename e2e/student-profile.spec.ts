import { test, expect } from '@playwright/test';
import { setupStudentAuth } from './helpers/auth.helper';

test.describe('Student Profile & Security E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupStudentAuth(page);

    // Mock student profile GET
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          fullName: 'أحمد محمود',
          email: 'student@draya.com',
          phone: '01012345678',
          gradeLevelName: 'الصف الثالث الثانوي - علمي رياضة',
          parentGuardianName: 'محمود عبد الله',
          parentGuardianPhone: '01098765432',
          parentGuardianEmail: 'parent@draya.com',
          profilePictureUrl: '',
        }),
      });
    });

    await page.goto('/student/profile');
  });

  test('should render profile header and avatar edit button', async ({ page }) => {
    const pageTitle = page.locator('h1, .page-title');
    await expect(pageTitle.first()).toBeVisible({ timeout: 10000 });

    const avatarBtn = page.locator('.btn-edit-avatar');
    await expect(avatarBtn.first()).toBeVisible();
  });

  test('should switch to parent tab and show parent name, phone, and email fields', async ({
    page,
  }) => {
    // Parent Tab
    const parentTab = page.locator('.tab-btn').filter({ hasText: 'ولي الأمر' }).first();
    await expect(parentTab).toBeVisible({ timeout: 10000 });
    await parentTab.click();

    const parentNameInput = page.locator('#parentNameInput');
    const parentPhoneInput = page.locator('#parentPhoneInput');
    const parentEmailInput = page.locator('#parentEmailInput');

    await expect(parentNameInput).toBeVisible();
    await expect(parentPhoneInput).toBeVisible();
    await expect(parentEmailInput).toBeVisible();
  });

  test('should switch to security tab and update password rule tags', async ({ page }) => {
    const securityTab = page.locator('.tab-btn').filter({ hasText: 'الأمان' }).first();
    await expect(securityTab).toBeVisible({ timeout: 10000 });
    await securityTab.click();

    const currentPass = page.locator('#currentPassInput');
    const newPass = page.locator('#newPassInput');
    const confirmPass = page.locator('#confirmPassInput');

    await expect(currentPass).toBeVisible();
    await expect(newPass).toBeVisible();
    await expect(confirmPass).toBeVisible();

    await newPass.fill('Password123');
    await confirmPass.fill('Password123');

    // Check valid rule tag
    const validTag = page.locator('.rule-tag.valid');
    await expect(validTag.first()).toBeVisible();
  });
});
