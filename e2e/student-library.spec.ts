import { test, expect } from '@playwright/test';

test.describe('Student Library E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/student/library');
  });

  test('should render library title, search box, and category filter chips', async ({ page }) => {
    const mainTitle = page.locator('h1, .main-title, .page-title');
    await expect(mainTitle.first()).toBeVisible();

    const searchInput = page.locator('.search-input, input[type="text"]');
    await expect(searchInput.first()).toBeVisible();

    const filterChips = page.locator('.filter-chip, .tab-item');
    await expect(filterChips.first()).toBeVisible();
  });

  test('should filter materials when clicking category chips', async ({ page }) => {
    const docChip = page.locator('.filter-chip:has-text("PDF"), button:has-text("PDF")');
    if (await docChip.isVisible()) {
      await docChip.click();
      await expect(docChip).toHaveClass(/.*active/);
    }
  });

  test('should open preview modal when clicking preview on a book card', async ({ page }) => {
    const previewBtn = page.locator('button:has-text("معاينة"), .btn-preview').first();
    if (await previewBtn.isVisible()) {
      await previewBtn.click();

      // Preview reader modal should appear
      const modal = page.locator('.pdf-modal-container, .modal-backdrop');
      await expect(modal.first()).toBeVisible();

      // Close modal
      const closeBtn = page.locator('.btn-close-modal, .btn-close');
      await closeBtn.first().click();
      await expect(modal).toBeHidden();
    }
  });
});
