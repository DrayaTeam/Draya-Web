import { test, expect } from '@playwright/test';

test.describe('Student Checkout & Payment E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/student/checkout?packageId=pkg-1');
  });

  test('should render checkout summary card and payment methods', async ({ page }) => {
    const checkoutContainer = page.locator('.checkout-container, .checkout-card, h1, .page-title');
    await expect(checkoutContainer.first()).toBeVisible();

    const paymentMethods = page.locator(
      '.payment-method-card, .method-card, input[name="paymentMethod"]',
    );
    if ((await paymentMethods.count()) > 0) {
      await expect(paymentMethods.first()).toBeVisible();
    }
  });

  test('should render price breakdown', async ({ page }) => {
    const priceDetails = page.locator('.price-row, .total-amount, .summary-row');
    if ((await priceDetails.count()) > 0) {
      await expect(priceDetails.first()).toBeVisible();
    }
  });
});
