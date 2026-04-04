import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
  });

  test('should load home page', async ({ page }) => {
    // Check if page loads successfully
    await expect(page).toHaveTitle(/Qaudquan/i);
  });

  test('should render main layout', async ({ page }) => {
    // Check for main layout elements
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate between pages', async ({ page }) => {
    // Test navigation - update with actual navigation elements
    const links = page.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});
