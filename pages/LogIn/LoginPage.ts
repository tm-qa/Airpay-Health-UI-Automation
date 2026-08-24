import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly userMobileInput: Locator;
  readonly continueButton: Locator;
  readonly otpInput: Locator;
  readonly verifyOtpButton: Locator;



  constructor(page: Page) {
    this.page = page;
    this.userMobileInput = page.getByRole('textbox', { name: 'Enter Your Mobile Number' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.otpInput = page.getByRole('textbox');
    this.verifyOtpButton = page.getByRole('button', { name: 'Verify OTP' });

  }

  async navigateToLogin() {
    await this.page.goto('https://airpay.saas-sanity.turtle-feature.com/signup');
  }


  async login() {
    await this.userMobileInput.fill('6999912345');
    await this.continueButton.click();
    await expect(this.verifyOtpButton).toBeEnabled();
    await this.otpInput.fill('1234');
    await this.verifyOtpButton.click();
  }
}