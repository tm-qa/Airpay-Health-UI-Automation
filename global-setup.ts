import { chromium } from '@playwright/test';
import { LoginPage } from './pages/LogIn/LoginPage';

export default async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const login = new LoginPage(page);

  await login.navigateToLogin();
  await login.login();

  await page.waitForURL('**/dashboard', { timeout: 60000 });

  await context.storageState({ path: 'storageState.json' });

  await browser.close();
}

