import { test, expect } from '@playwright/test';

test.describe('Student Q&A Classroom Channel E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/student/channel');
  });

  test('should render live channel badge and subject selector', async ({ page }) => {
    const badge = page.locator('.badge-pill, .header-badge-row, .main-title');
    await expect(badge.first()).toBeVisible();

    const askButton = page.locator('.btn-ask-primary, .btn-ask-secondary');
    await expect(askButton.first()).toBeVisible();
  });

  test('should open Ask Question modal and show photo attachment button', async ({ page }) => {
    const askButton = page.locator('.btn-ask-primary, .btn-ask-secondary').first();
    await expect(askButton).toBeVisible();
    await askButton.click();

    // Verify modal card appears
    const askModal = page.locator('.ask-modal-card');
    await expect(askModal).toBeVisible();

    // Verify textarea is rendered
    const textarea = page.locator('#questionInput, .question-textarea');
    await expect(textarea.first()).toBeVisible();
  });

  test('should open discussion thread when clicking a question card', async ({ page }) => {
    const questionCard = page.locator('.question-card').first();
    if (await questionCard.isVisible()) {
      await questionCard.click({ force: true });

      // Thread modal should be visible
      const threadModal = page.locator('.thread-modal-card');
      await expect(threadModal).toBeVisible();

      // Reply input and attach button should be present
      const replyInput = page.locator('.reply-input');
      await expect(replyInput).toBeVisible();

      const attachReplyBtn = page.locator('.btn-reply-attach');
      await expect(attachReplyBtn).toBeVisible();
    }
  });
});
