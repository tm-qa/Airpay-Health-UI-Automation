import { Page, Locator } from "@playwright/test";
import { attachment, step } from "allure-js-commons";

export class BasePage {
    constructor(protected page: Page) {}

    private async report(action: string, takeSnap = false, fullPage = false) {
        // const timestamp = new Date().toISOString();
        const timestampIST = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" });
        console.log(`[${timestampIST}] : AUTOMATION_LOG: ==> ${action}`);
        if (!takeSnap) return;
        await step(action, async () => {
            await attachment(`${action} - Screenshot`, await this.page.screenshot({ fullPage, animations: "disabled"}), "image/png");
        });
    }

    async click(l: Locator, name = "Click", options?: Parameters<Locator["click"]>[0]) {
        await l.click(options);
        await this.report(name, false);
    }

    async fill(l: Locator, value: string, name = "Fill") {
        await l.fill(value);
        await this.report(`${name}: ${value}`, false);
    }

    async check(l: Locator, name = "Check", options?: Parameters<Locator["check"]>[0]) {
        await l.check(options);
        await this.report(name, false);
    }

    async uncheck(l: Locator, name = "Uncheck") {
        await l.uncheck();
        await this.report(name, false);
    }

    async select(l: Locator, value: string, name = "Select") {
        await l.selectOption(value);
        await this.report(`${name}: ${value}`, false);
    }

    async hover(l: Locator, name = "Hover") {
        await l.hover();
        await this.report(name, false);
    }

    async press(l: Locator, key: string, name = "Press") {
        await l.press(key);
        await this.report(`${name}: ${key}`, false);
    }

    async clear(l: Locator, name = "Clear") {
        await l.clear();
        await this.report(name, false);
    }

    async log(action: string) {
        await this.report(action, false);
    }

    async fullScreenScreenshot(name = "Full Page Screenshot") {
        await this.report(name, true, true);
    }
}
