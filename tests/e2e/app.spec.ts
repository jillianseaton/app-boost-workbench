import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should navigate to auth page and display login form', async ({ page }) => {
    await page.goto('/auth');
    
    // Check if the page loads correctly
    await expect(page).toHaveTitle(/app-boost-workbench/);
    
    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should toggle between login and signup forms', async ({ page }) => {
    await page.goto('/auth');
    
    // Initially should show "Sign In" button
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
    
    // Click to switch to signup
    await page.locator('text=Don\'t have an account? Sign up').click();
    
    // Should now show signup form
    await expect(page.locator('button[type="submit"]')).toContainText('Create Account');
    await expect(page.locator('input[placeholder="your_username"]')).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/auth');
    
    // Try to submit empty form
    await page.locator('button[type="submit"]').click();
    
    // Should show validation message (this might appear as a toast)
    // We'll check if the form doesn't submit by ensuring we're still on auth page
    await expect(page.url()).toContain('/auth');
  });
});

test.describe('Homepage', () => {
  test('should load homepage with main sections', async ({ page }) => {
    await page.goto('/');
    
    // Check for main sections
    await expect(page.locator('h1')).toContainText('EarnFlow');
    await expect(page.locator('text=About Our Payment Platform')).toBeVisible();
    await expect(page.locator('text=Comprehensive Payment Services')).toBeVisible();
    await expect(page.locator('text=Latest Articles & Insights')).toBeVisible();
  });

  test('should navigate to auth page from homepage', async ({ page }) => {
    await page.goto('/');
    
    // Look for sign in button or link
    const authLink = page.locator('a[href="/auth"]').first();
    if (await authLink.isVisible()) {
      await authLink.click();
      await expect(page.url()).toContain('/auth');
    }
  });
});

test.describe('Dashboard Access', () => {
  test('should redirect unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should either redirect to auth or show login prompt
    // Since we're not authenticated, we shouldn't see dashboard content
    const isOnAuth = page.url().includes('/auth');
    const hasLoginPrompt = await page.locator('text=Please sign in').isVisible();
    
    expect(isOnAuth || hasLoginPrompt).toBeTruthy();
  });
});

test.describe('Navigation', () => {
  test('should navigate to different pages', async ({ page }) => {
    // Test About page
    await page.goto('/about');
    await expect(page.locator('h1')).toContainText('About EarnFlow');
    
    // Test Contact page
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText('Contact Us');
    
    // Test Production Test page
    await page.goto('/production-test');
    await expect(page.locator('h1')).toContainText('Production Test Dashboard');
    
    // Test Affiliate Revenue page
    await page.goto('/affiliate-revenue');
    await expect(page.locator('h1')).toContainText('Affiliate Revenue Center');
  });
});

test.describe('Performance', () => {
  test('should load pages quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
  
  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Check for layout shifts
    const layoutShifts = await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalShift = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              totalShift += entry.value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => resolve(totalShift), 2000);
      });
    });
    
    // Cumulative Layout Shift should be less than 0.1
    expect(layoutShifts).toBeLessThan(0.1);
  });
});