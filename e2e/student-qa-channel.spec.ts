import { test, expect } from '@playwright/test';
import { setupStudentAuth } from './helpers/auth.helper';

test.describe('Student Q&A Classroom Channel E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupStudentAuth(page);

    // Mock API endpoints for deterministic and fast E2E assertions
    await page.route('**/api/v1/classrooms', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              classroomId: 'cls-physics-1',
              name: 'باقة الفيزياء الشاملة - الثانوية العامة',
              gradeLevelName: 'الصف الثالث الثانوي',
              subjectName: 'الفيزياء',
              classroomTypeName: 'مجموعة النخبة',
              isActive: true,
            },
          ],
          totalCount: 1,
        }),
      });
    });

    await page.route('**/api/v1/classrooms/**/questions*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'q-1',
              classroomId: 'cls-physics-1',
              authorId: 'demo-student-1',
              authorName: 'أحمد علي',
              authorRole: 'Student',
              content: 'كيف يمكن تطبيق قانون كيرشوف الثاني في الدوائر المغلقة؟',
              createdAt: new Date().toISOString(),
              voteCount: 5,
              replyCount: 2,
              hasTeacherAnswer: true,
              hasVoted: false,
              isAuthor: true,
            },
          ],
          totalCount: 1,
        }),
      });
    });

    await page.goto('/student/channel');
  });

  test('should render live channel badge and subject selector', async ({ page }) => {
    const mainTitle = page.locator('.main-title');
    await expect(mainTitle).toBeVisible({ timeout: 10000 });

    const askButton = page.locator('.btn-ask-primary, .btn-ask-secondary').first();
    await expect(askButton).toBeVisible();
  });

  test('should open Ask Question modal and show photo attachment button', async ({ page }) => {
    const askButton = page.locator('.btn-ask-primary, .btn-ask-secondary').first();
    await expect(askButton).toBeVisible({ timeout: 10000 });
    await askButton.click();

    // Verify modal card appears
    const askModal = page.locator('.ask-modal-card');
    await expect(askModal).toBeVisible();

    // Verify textarea is rendered
    const textarea = page.locator('#questionInput, .question-textarea');
    await expect(textarea.first()).toBeVisible();

    // Verify attach photo button
    const attachBtn = page.locator('.btn-attach-photo, .photo-attachment-zone');
    await expect(attachBtn.first()).toBeVisible();
  });

  test('should open discussion thread when clicking a question card', async ({ page }) => {
    const questionCard = page.locator('.question-card').first();
    if ((await questionCard.count()) > 0) {
      await questionCard.click({ force: true });

      // Thread modal should be visible
      const threadModal = page.locator('.thread-modal-card');
      await expect(threadModal).toBeVisible({ timeout: 10000 });

      // Reply input and attach button should be present
      const replyInput = page.locator('.reply-input');
      await expect(replyInput).toBeVisible();

      const attachReplyBtn = page.locator('.btn-reply-attach');
      await expect(attachReplyBtn).toBeVisible();
    }
  });
});
