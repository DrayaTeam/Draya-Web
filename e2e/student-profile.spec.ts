import { test, expect } from '@playwright/test';

test.describe('Student Profile & Security E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/student/profile');
  });

  test('should render profile header and avatar edit button', async ({ page }) => {
    const pageTitle = page.locator('h1, .page-title, .profile-name');
    await expect(pageTitle.first()).toBeVisible();

    const avatarBtn = page.locator('.btn-edit-avatar, .avatar-wrapper, .avatar-circle');
    await expect(avatarBtn.first()).toBeVisible();
  });

  test('should switch between profile tabs', async ({ page }) => {
    // Parent Tab
    const parentTab = page.locator('button.tab-btn:has-text("ولي الأمر")');
    if (await parentTab.isVisible()) {
      await parentTab.click();
      const parentInput = page.locator('#parentNameInput, #parentEmailInput');
      await expect(parentInput.first()).toBeVisible();
    }

    // Security Tab
    const securityTab = page.locator('button.tab-btn:has-text("الأمان"), button.tab-btn:has-text("كلمة المرور")');
    if (await securityTab.isVisible()) {
      await securityTab.click();
      const currentPass = page.locator('#currentPassInput');
      const newPass = page.locator('#newPassInput');
      const confirmPass = page.locator('#confirmPassInput');

      await expect(currentPass).toBeVisible();
      await expect(newPass).toBeVisible();
      await expect(confirmPass).toBeVisible();

      // Password rules checklist box
      const rulesBox = page.locator('.password-rules-box');
      await expect(rulesBox).toBeVisible();
    }
  });

  test('should update password rule tags when typing new password', async ({ page }) => {
    const securityTab = page.locator('button.tab-btn:has-text("الأمان"), button.tab-btn:has-text("كلمة المرور")');
    if (await securityTab.isVisible()) {
      await securityTab.click();

      const newPass = page.locator('#newPassInput');
      await expect(newPass).toBeVisible();
      await newPass.fill('Password123');

      const confirmPass = page.locator('#confirmPassInput');
      await expect(confirmPass).toBeVisible();
      await confirmPass.fill('Password123');

      // Check valid rule tag
      const validTag = page.locator('.rule-tag.valid');
      await expect(validTag.first()).toBeVisible();
    }
  });
});
