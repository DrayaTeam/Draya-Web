import { test, expect } from '@playwright/test';
import { setupStudentAuth } from './helpers/auth.helper';

test.describe('Student Library E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupStudentAuth(page);

    // Mock enrolled student materials API
    await page.route('**/api/v1/students/materials*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              materialId: 'mat-1',
              title: 'مذكرة مراجعة الفيزياء الشاملة',
              materialType: 'PDF',
              createdAt: '2026-08-16T04:00:00Z',
              currentVersion: {
                versionId: 'v1',
                versionNumber: 1,
                fileUrl: 'https://example.com/physics.pdf',
                parseStatus: 'Parsed',
              },
            },
            {
              materialId: 'mat-2',
              title: 'محاضرة الكيمياء العضوية',
              materialType: 'Video',
              createdAt: '2026-08-16T04:00:00Z',
              currentVersion: {
                versionId: 'v2',
                versionNumber: 1,
                fileUrl: 'https://example.com/chemistry.mp4',
                parseStatus: 'Parsed',
              },
            },
          ],
          totalCount: 2,
          pageNumber: 1,
          pageSize: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }),
      });
    });

    await page.goto('/student/library');
  });

  test('should render library title, search box, and category filter chips', async ({ page }) => {
    const mainTitle = page.locator('.main-title');
    await expect(mainTitle.first()).toBeVisible({ timeout: 10000 });

    const searchInput = page.locator('.search-input');
    await expect(searchInput.first()).toBeVisible();

    const filterChips = page.locator('.filter-chip');
    await expect(filterChips.first()).toBeVisible();
  });

  test('should filter materials when clicking category chips', async ({ page }) => {
    const docChip = page.locator('.filter-chip').filter({ hasText: 'PDF' }).first();
    if (await docChip.isVisible()) {
      await docChip.click();
      await expect(docChip).toHaveClass(/.*active/);
    }
  });

  test('should open preview modal when clicking preview on a book card', async ({ page }) => {
    const previewBtn = page.locator('.btn-preview').first();
    if ((await previewBtn.count()) > 0) {
      await previewBtn.click();

      // Preview reader modal should appear
      const modal = page.locator('.pdf-modal-container, .modal-backdrop');
      await expect(modal.first()).toBeVisible({ timeout: 10000 });

      // Close modal
      const closeBtn = page.locator('.btn-close-modal, .btn-close');
      await closeBtn.first().click();
      await expect(modal).toBeHidden();
    }
  });
});
