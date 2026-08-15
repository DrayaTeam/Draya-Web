// scratch/test-teacher-dashboard-e2e.js
const { chromium } = require('playwright');
const path = require('path');

const TARGET_URL = 'http://localhost:4200/teacher/dashboard';
const DESKTOP_SCREENSHOT = 'C:/Users/ana7o/.gemini/antigravity/brain/51236a8f-04bc-453b-bf68-3a98c9146101/teacher_dashboard_desktop.png';
const MOBILE_SCREENSHOT = 'C:/Users/ana7o/.gemini/antigravity/brain/51236a8f-04bc-453b-bf68-3a98c9146101/teacher_dashboard_mobile.png';

const CHROMIUM_PATH = 'C:/Users/ana7o/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe';

(async () => {
  console.log('🚀 Launching Playwright E2E test for Teacher Dashboard...');
  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true
  });

  // 1. Desktop Test
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await desktopContext.newPage();

  console.log(`📡 Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

  // Verify page title / heading
  const title = await page.title();
  console.log(`✅ Page Title: "${title}"`);

  // Verify sub-components are in the DOM
  await page.waitForSelector('draya-teacher-welcome-header');
  await page.waitForSelector('draya-teacher-ai-reports-banner');
  await page.waitForSelector('draya-teacher-kpi-grid');
  await page.waitForSelector('draya-teacher-submissions-chart');
  await page.waitForSelector('draya-teacher-quick-actions');
  await page.waitForSelector('draya-teacher-attention-alerts');
  await page.waitForSelector('draya-teacher-followup-table');
  await page.waitForSelector('draya-teacher-recent-submissions-table');

  console.log('✅ All 8 decomposed sub-components loaded successfully in DOM!');

  // Test Time Range Switcher Click
  const monthBtn = page.locator('.range-btn', { hasText: 'شهر' });
  await monthBtn.click();
  console.log('✅ Time range clicked: "شهر"');

  // Take Desktop Screenshot
  await page.screenshot({ path: DESKTOP_SCREENSHOT, fullPage: true });
  console.log(`📸 Desktop screenshot saved: ${DESKTOP_SCREENSHOT}`);

  // 2. Mobile Viewport Test
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(TARGET_URL, { waitUntil: 'networkidle' });

  await mobilePage.waitForSelector('.mobile-burger-btn');
  console.log('✅ Mobile top bar & burger button detected!');

  // Click burger button to open drawer
  await mobilePage.click('.mobile-burger-btn');
  await mobilePage.waitForTimeout(300);

  // Take Mobile Screenshot
  await mobilePage.screenshot({ path: MOBILE_SCREENSHOT, fullPage: true });
  console.log(`📸 Mobile screenshot saved: ${MOBILE_SCREENSHOT}`);

  await browser.close();
  console.log('🎉 E2E Verification Completed Successfully!');
})();
