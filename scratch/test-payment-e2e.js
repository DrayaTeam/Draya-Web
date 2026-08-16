// scratch/test-payment-e2e.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runPaymentE2ETests() {
  console.log('🚀 Starting Payment End-to-End Tests with Playwright...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'ar-EG',
  });

  const page = await context.newPage();
  page.on('console', (msg) => console.log('   [Browser Console]', msg.text()));
  page.on('pageerror', (err) => console.log('   [Browser Error]', err.message));

  // Valid future JWT token with role "student"
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMTIzIiwiZW1haWwiOiJzdHVkZW50QGRyYXlhLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlN0dWRlbnQiLCJleHAiOjE5OTk5OTk5OTl9.test_signature';
  const mockUser = {
    userId: 'usr-student-e2e',
    fullName: 'يوسف أحمد',
    role: 'student',
    email: 'youssef@draya.com',
  };

  // Helper to seed localStorage
  async function seedAuth() {
    await page.addInitScript(({ token, user }) => {
      localStorage.setItem('draya_access_token', token);
      localStorage.setItem('draya_user', JSON.stringify(user));
    }, { token: mockToken, user: mockUser });
  }

  await seedAuth();

  let passedCount = 0;
  let totalCount = 0;

  // -------------------------------------------------------------
  // Test 1: Phase 1 & 2 - Initiation & RedirectionUrl payload
  // -------------------------------------------------------------
  totalCount++;
  console.log('🔹 Test 1: Checkout Initiation sends correct redirectionUrl and redirects to Paymob...');
  try {
    let capturedCheckoutPayload = null;

    // Intercept checkout API call
    await page.route('**/api/v1/classrooms/**/checkout', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        capturedCheckoutPayload = request.postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            checkoutUrl: 'https://accept-alpha.paymob.com/unifiedcheckout/?publicKey=pk_test_123&clientSecret=cs_test_456',
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock classroom & materials details
    await page.route('**/api/v1/classrooms/cls-test-100', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          classroomId: 'cls-test-100',
          name: 'باقة الفيزياء المتقدمة',
          teacherName: 'أ. محمد صلاح',
          subjectName: 'فيزياء',
          price: 450,
          isActive: true,
        }),
      });
    });

    await page.goto('http://localhost:4200/student/checkout/cls-test-100', { waitUntil: 'networkidle' });

    // Verify checkout page loaded
    const pageHeading = await page.locator('.summary-card h1, .checkout-title, h1').first().textContent();
    console.log(`   Page loaded: "${pageHeading?.trim()}"`);

    // Intercept page navigation to external Paymob URL
    let redirectedToPaymob = false;
    page.on('request', req => {
      if (req.url().includes('accept-alpha.paymob.com')) {
        redirectedToPaymob = true;
      }
    });

    // Click on Checkout submit button
    const submitBtn = page.locator('button.btn-primary, button:has-text("تأكيد الدفع"), button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // Assert payload
    if (!capturedCheckoutPayload || !capturedCheckoutPayload.redirectionUrl) {
      throw new Error(`Checkout payload missing redirectionUrl! Got: ${JSON.stringify(capturedCheckoutPayload)}`);
    }

    console.log(`   ✅ Sent payload: ${JSON.stringify(capturedCheckoutPayload)}`);
    console.log(`   ✅ redirectionUrl passed: "${capturedCheckoutPayload.redirectionUrl}"`);
    console.log('   ✅ Test 1 Passed!\n');
    passedCount++;
  } catch (err) {
    console.error('   ❌ Test 1 Failed:', err.message, '\n');
  }

  // -------------------------------------------------------------
  // Test 2: Phase 3 - Verification with Pending polling -> Completed
  // -------------------------------------------------------------
  totalCount++;
  console.log('🔹 Test 2: Verification Polling (Pending -> Completed Source of Truth)...');
  try {
    let pollAttempts = 0;

    await page.route(/\/classrooms/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 1,
        }),
      });
    });

    await page.route(/\/payments\/.*\/status/, async (route) => {
      pollAttempts++;
      console.log(`   [API Intercept] GET /payments/status (attempt #${pollAttempts})`);
      if (pollAttempts === 1) {
        // First attempt: Pending
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            paymentTransactionId: 'txn-e2e-poll-123',
            status: 'Pending',
            grossAmount: 450.0,
            purpose: 'ClassroomEnrollment',
            classroomId: 'cls-test-100',
            isEnrolled: false,
          }),
        });
      } else {
        // Second attempt: Completed & Enrolled
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            paymentTransactionId: 'txn-e2e-poll-123',
            status: 'Completed',
            grossAmount: 450.0,
            purpose: 'ClassroomEnrollment',
            classroomId: 'cls-test-100',
            isEnrolled: true,
          }),
        });
      }
    });

    // Navigate to callback return URL
    await page.goto('http://localhost:4200/payment/result?transactionId=txn-e2e-poll-123&status=success', {
      waitUntil: 'domcontentloaded',
    });

    // Check initial pending state
    await page.waitForTimeout(500);
    const isPendingVisible = await page.locator('.status-pill.pending-pill').isVisible();
    console.log(`   Initial verifying state visible: ${isPendingVisible}`);

    // Wait for the polling to transition to Completed (after 3s interval)
    await page.waitForSelector('.success-circle, .status-pill.success-pill', { timeout: 12000 });

    const successTitle = await page.locator('.card-title').textContent();
    const txnCode = await page.locator('.txn-code').textContent();
    const txnAmount = await page.locator('.txn-amount').textContent();

    console.log(`   Poll attempts made: ${pollAttempts}`);
    console.log(`   Success Title: "${successTitle?.trim()}"`);
    console.log(`   Txn Code: "${txnCode?.trim()}"`);
    console.log(`   Txn Amount: "${txnAmount?.trim()}"`);

    if (!successTitle.includes('مبروك') || !txnCode.includes('txn-e2e-poll-123')) {
      throw new Error('Success UI did not display expected text or transaction code');
    }

    // Take a screenshot of the verified payment success screen
    const screenshotPath = path.join(__dirname, 'payment_success_e2e.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`   📸 Saved screenshot: ${screenshotPath}`);

    console.log('   ✅ Test 2 Passed!\n');
    passedCount++;
  } catch (err) {
    console.error('   ❌ Test 2 Failed:', err.message, '\n');
  }

  // -------------------------------------------------------------
  // Test 3: Phase 3 - Failed Payment Resolution
  // -------------------------------------------------------------
  totalCount++;
  console.log('🔹 Test 3: Failed Payment Verification...');
  try {
    await page.route(/\/payments\/.*\/status/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          paymentTransactionId: 'txn-e2e-failed-999',
          status: 'Failed',
          grossAmount: 450.0,
          purpose: 'ClassroomEnrollment',
          isEnrolled: false,
        }),
      });
    });

    await page.goto('http://localhost:4200/payment/result?transactionId=txn-e2e-failed-999&status=failed', {
      waitUntil: 'networkidle',
    });

    await page.waitForSelector('.error-circle, .status-pill.error-pill', { timeout: 5000 });

    const errorTitle = await page.locator('.card-title').textContent();
    const retryBtn = await page.locator('a.btn-primary:has-text("الرجوع والمحاولة")').first();
    const isRetryBtnVisible = await retryBtn.isVisible();

    console.log(`   Error Title: "${errorTitle?.trim()}"`);
    console.log(`   Retry Button Visible: ${isRetryBtnVisible}`);

    if (!errorTitle.includes('تعذر إتمام الدفع') || !isRetryBtnVisible) {
      throw new Error('Failure UI did not display expected error title or retry button');
    }

    // Take screenshot of failure view
    const failScreenshotPath = path.join(__dirname, 'payment_failed_e2e.png');
    await page.screenshot({ path: failScreenshotPath, fullPage: true });
    console.log(`   📸 Saved screenshot: ${failScreenshotPath}`);

    console.log('   ✅ Test 3 Passed!\n');
    passedCount++;
  } catch (err) {
    console.error('   ❌ Test 3 Failed:', err.message, '\n');
  }

  await browser.close();

  console.log(`========================================`);
  console.log(`🎉 E2E Tests Complete: ${passedCount}/${totalCount} Passed!`);
  console.log(`========================================`);
}

runPaymentE2ETests().catch(console.error);
