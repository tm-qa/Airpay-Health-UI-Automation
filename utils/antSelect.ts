import { Locator, Page } from "@playwright/test";

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const openDropdownPanel = (page: Page) =>
    page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)").last();

const optionByText = (page: Page, text: string) =>
    openDropdownPanel(page)
        .locator(".ant-select-item-option")
        .filter({ hasText: new RegExp(`^\\s*${escapeRe(text)}\\s*$`, "i") })
        .first();


async function openDropdown(combobox: Locator) {
    await combobox.scrollIntoViewIfNeeded();

    if ((await combobox.getAttribute("aria-expanded")) === "true") return;

    const root = combobox.locator(
        "xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' ant-select ')][1]"
    );
    await root.locator(".ant-select-selector").click();
}

export async function selectAntOption(page: Page, combobox: Locator, optionText: string) {
    await openDropdown(combobox);
    await page.keyboard.type(optionText); 
    const option = optionByText(page, optionText);
    try {
        await option.click({ timeout: 3000 });
    } catch {
        await openDropdown(combobox);
        await option.dispatchEvent("click");
    }
}

export async function selectAntOptionFromList(page: Page, combobox: Locator, options: string[]) {
    for (const optionText of options) {
        await openDropdown(combobox);

        const option = optionByText(page, optionText);
        const found = await option
            .waitFor({ state: "visible", timeout: 2000 })
            .then(() => true)
            .catch(() => false);

        if (found) {
            await option.click();
            return;
        }
        await page.keyboard.press("Escape"); 
    }

    throw new Error(`None of the options were found: ${options.join(", ")}`);
}

// import { Locator, Page } from "@playwright/test";

// const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// const openDropdownPanel = (page: Page) =>
//     page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)").last();

// const optionByText = (page: Page, text: string) =>
//     openDropdownPanel(page)
//         .locator(".ant-select-item-option")
//         .filter({ hasText: new RegExp(`^\\s*${escapeRe(text)}\\s*$`, "i") })
//         .first();


// async function openDropdown(combobox: Locator) {
//     await combobox.scrollIntoViewIfNeeded();

//     if ((await combobox.getAttribute("aria-expanded")) === "true") return;

//     const root = combobox.locator(
//         "xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' ant-select ')][1]"
//     );
//     await root.locator(".ant-select-selector").click();
// }

// export async function selectAntOption(page: Page, combobox: Locator, optionText: string) {
//     await openDropdown(combobox);
//     const option = optionByText(page, optionText);
//     try {
//         await option.click({ timeout: 3000 });
//     } catch {
//         await openDropdown(combobox);
//         await option.dispatchEvent("click");
//     }
// }

// export async function selectAntOptionFromList(page: Page, combobox: Locator, options: string[]) {
//     for (const optionText of options) {
//         await openDropdown(combobox);

//         const option = optionByText(page, optionText);
//         const found = await option
//             .waitFor({ state: "visible", timeout: 2000 })
//             .then(() => true)
//             .catch(() => false);

//         if (found) {
//             await option.click();
//             return;
//         }
//         await page.keyboard.press("Escape"); 
//     }

//     throw new Error(`None of the options were found: ${options.join(", ")}`);
// }

// import { Locator, Page } from "@playwright/test";

// const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// const openDropdownPanel = (page: Page) =>
//     page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)").last();

// const optionByText = (page: Page, text: string) =>
//     openDropdownPanel(page)
//         .locator(".ant-select-item-option")
//         .filter({ hasText: new RegExp(`^\\s*${escapeRe(text)}\\s*$`, "i") })
//         .first();

// async function openDropdown(combobox: Locator) {
//     await combobox.scrollIntoViewIfNeeded();

//     if ((await combobox.getAttribute("aria-expanded")) === "true") return;

//     const root = combobox.locator(
//         "xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' ant-select ')][1]"
//     );
//     await root.locator(".ant-select-selector").click();
// }

// export async function selectAntOption(page: Page, combobox: Locator, optionText: string) {
//     await openDropdown(combobox);
//     await optionByText(page, optionText).click(); // auto-waits for visible + stable
// }

// export async function selectAntOptionFromList(page: Page, combobox: Locator, options: string[]) {
//     for (const optionText of options) {
//         await openDropdown(combobox);

//         const option = optionByText(page, optionText);
//         const found = await option
//             .waitFor({ state: "visible", timeout: 2000 })
//             .then(() => true)
//             .catch(() => false);

//         if (found) {
//             await option.click();
//             return;
//         }
//         await page.keyboard.press("Escape"); // close before trying the next candidate
//     }

//     throw new Error(`None of the options were found: ${options.join(", ")}`);
// }


// import { Locator, Page } from "@playwright/test";

// const optionByText = (page: Page, text: string) =>
//     page
//         .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option")
//         .filter({ hasText: new RegExp(`^ ${text} $`, "i") })
//         .first();

// async function openDropdown(combobox: Locator) {
//     await combobox.evaluate((el) => el.scrollIntoView({ block: "center" }));
//     await combobox.click({ force: true });
// }

// export async function selectAntOption(page: Page, combobox: Locator, optionText: string) {
//     await openDropdown(combobox);
//     await page.keyboard.type(optionText);
//     await optionByText(page, optionText).click(); // auto-waits for visible and stable
// }

// export async function selectAntOptionFromList(page: Page, combobox: Locator, options: string[]) {
//     await openDropdown(combobox);
//     for (const optionText of options) {
//         await page.keyboard.type(optionText);
//         const option = optionByText(page, optionText);
//         const found = await option
//             .waitFor({ state: "visible", timeout: 2000 })
//             .then(() => true)
//             .catch(() => false);
//         if (found) {
//             await option.click();
//             return;
//         }
//     }
//     throw new Error(`None of the options were found: ${options.join(", ")} `);
// }


// import { Locator, Page } from "@playwright/test";

// const optionByText = (page: Page, text: string) =>
//     page
//         .locator(
//             ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option"
//         )
//         .filter({
//             hasText: new RegExp(
//                 `^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`,
//                 "i"
//             ),
//         })
//         .locator(":visible")
//         .first();

// async function openDropdown(combobox: Locator) {
//     await combobox.scrollIntoViewIfNeeded();

//     const select = combobox.locator("xpath=ancestor::div[contains(@class,'ant-select')][1]");

//     await select.click();
// }

// export async function selectAntOption(
//     page: Page,
//     combobox: Locator,
//     optionText: string
// ) {
//     await openDropdown(combobox);

//     const option = optionByText(page, optionText);
//     await option.waitFor({ state: "visible", timeout: 5000 });
//     await option.click();
// }

// export async function selectAntOptionFromList(
//     page: Page,
//     combobox: Locator,
//     options: string[]
// ) {
//     for (const optionText of options) {
//         await openDropdown(combobox);

//         const option = optionByText(page, optionText);
//         const found = await option
//             .waitFor({ state: "visible", timeout: 2000 })
//             .then(() => true)
//             .catch(() => false);

//         if (found) {
//             await option.click();
//             return;
//         }
//     }

//     throw new Error(
//         `None of the options were found: ${options.join(", ")}`
//     );
// }


// import { Locator, Page } from "@playwright/test";

// const optionByText = (page: Page, text: string) =>
//     page
//         .locator(
//             ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option"
//         )
//         .filter({
//             hasText: new RegExp(
//                 `^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`,
//                 "i"
//             ),
//         })
//         .locator(":visible")
//         .first();

// async function openDropdown(combobox: Locator) {
//     await combobox.scrollIntoViewIfNeeded();
//     await combobox.click();
// }

// export async function selectAntOption(
//     page: Page,
//     combobox: Locator,
//     optionText: string
// ) {
//     await openDropdown(combobox);
//     await optionByText(page, optionText).click();
// }

// export async function selectAntOptionFromList(
//     page: Page,
//     combobox: Locator,
//     options: string[]
// ) {
//     for (const optionText of options) {
//         await openDropdown(combobox);

//         const option = optionByText(page, optionText);
//         const found = await option
//             .waitFor({ state: "visible", timeout: 2000 })
//             .then(() => true)
//             .catch(() => false);

//         if (found) {
//             await option.click();
//             return;
//         }
//     }

//     throw new Error(`None of the options were found: ${options.join(", ")}`);
// }

// import { Locator, Page } from "@playwright/test";

// const optionByText = (page: Page, text: string) =>
//     page
//         .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option")
//         .filter({ hasText: new RegExp(`^ ${text} $`, "i") })
//         .first();

// async function openDropdown(combobox: Locator) {
//     await combobox.evaluate((el) => el.scrollIntoView({ block: "center" }));
//     await combobox.click({ force: true });
// }

// export async function selectAntOption(page: Page, combobox: Locator, optionText: string) {
//     await openDropdown(combobox);
//     await page.keyboard.type(optionText);
//     await optionByText(page, optionText).click(); // auto-waits for visible and stable
// }

// export async function selectAntOptionFromList(page: Page, combobox: Locator, options: string[]) {
//     await openDropdown(combobox);
//     for (const optionText of options) {
//         await page.keyboard.type(optionText);
//         const option = optionByText(page, optionText);
//         const found = await option
//             .waitFor({ state: "visible", timeout: 2000 })
//             .then(() => true)
//             .catch(() => false);
//         if (found) {
//             await option.click();
//             return;
//         }
//     }
//     throw new Error(`None of the options were found: ${options.join(", ")} `);
// }

// import { Locator, Page } from "@playwright/test";

// // Same text match that worked before, but visible-only. The open dropdown is
// // rendered last in <body>, so .last() picks the real option, not the selected
// // value shown elsewhere on the page.
// const optionByText = (page: Page, text: string) =>
//     page.getByText(new RegExp(`^ ${ text } $`, "i")).locator("visible=true").last();

// async function openDropdown(combobox: Locator) {
//     await combobox.evaluate((el) => el.scrollIntoView({ block: "center" }));
//     await combobox.click({ force: true });
// }

// async function clickOption(option: Locator) {
//     await option.waitFor({ state: "visible" });
//     await option.evaluate((el) => (el as HTMLElement).click());
// }

// export async function selectAntOption(page: Page, combobox: Locator, optionText: string) {
//     await openDropdown(combobox);
//     await page.keyboard.type(optionText);
//     await clickOption(optionByText(page, optionText));
// }

// export async function selectAntOptionFromList(page: Page, combobox: Locator, options: string[]) {
//     await openDropdown(combobox);
//     for (const optionText of options) {
//         await page.keyboard.press("ControlOrMeta+A"); // clear the previous attempt
//         await page.keyboard.press("Backspace");
//         await page.keyboard.type(optionText);
//         const option = optionByText(page, optionText);
//         const found = await option
//             .waitFor({ state: "visible", timeout: 2000 })
//             .then(() => true)
//             .catch(() => false);
//         if (found) {
//             await clickOption(option);
//             return;
//         }
//     }
//     throw new Error(`None of the options were found: ${ options.join(", ") } `);
// }


// import { Locator, Page } from "@playwright/test";

// const optionByText = (page: Page, text: string) =>
//     page
//         .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option")
//         .filter({ hasText: new RegExp(`^ ${ text } $`, "i") })
//         .first();

// async function openDropdown(combobox: Locator) {
//     await combobox.evaluate((el) => el.scrollIntoView({ block: "center" }));
//     await combobox.click({ force: true });
// }

// export async function selectAntOption(page: Page, combobox: Locator, optionText: string) {
//     await openDropdown(combobox);
//     await page.keyboard.type(optionText);
//     await optionByText(page, optionText).click(); 
// }

// export async function selectAntOptionFromList(page: Page, combobox: Locator, options: string[]) {
//     await openDropdown(combobox);
//     for (const optionText of options) {
//         await page.keyboard.type(optionText);
//         const option = optionByText(page, optionText);
//         const found = await option
//             .waitFor({ state: "visible", timeout: 2000 })
//             .then(() => true)
//             .catch(() => false);
//         if (found) {
//             await option.click();
//             return;
//         }
//     }
//     throw new Error(`None of the options were found: ${ options.join(", ") } `);
// }


// import { Locator, Page } from "@playwright/test";

// const optionByText = (page: Page, text: string) =>
//     page.getByText(new RegExp(`^ ${ text } $`, "i")).last();

// async function openDropdown(combobox: Locator) {
//     await combobox.evaluate((el) => el.scrollIntoView({ block: "center" }));
//     await combobox.click({ force: true });
// }

// export async function selectAntOption(page: Page, combobox: Locator, optionText: string) {
//     await openDropdown(combobox);
//     await page.keyboard.type(optionText);
//     await optionByText(page, optionText).evaluate((el) => (el as HTMLElement).click());
// }

// export async function selectAntOptionFromList(page: Page, combobox: Locator, options: string[]) {
//     await openDropdown(combobox);
//     for (const optionText of options) {
//         await page.keyboard.type(optionText);
//         const option = optionByText(page, optionText);
//         const found = await option
//             .waitFor({ state: "attached", timeout: 2000 })
//             .then(() => true)
//             .catch(() => false);
//         if (found) {
//             await option.evaluate((el) => (el as HTMLElement).click());
//             return;
//         }
//     }
// }



// import { Locator, Page } from "@playwright/test";

// const optionByText = (page: Page, text: string) =>
//     page.getByText(new RegExp(`^ ${ text } $`, "i")).last();

// export async function selectAntOption(page: Page, combobox: Locator, optionText: string) {
//     await combobox.scrollIntoViewIfNeeded();
//     await combobox.click({ force: true });
//     await page.keyboard.type(optionText);
//     await optionByText(page, optionText).evaluate((el) => (el as HTMLElement).click());
// }

// export async function selectAntOptionFromList(page: Page, combobox: Locator, options: string[]) {
//     await combobox.scrollIntoViewIfNeeded();
//     await combobox.click({ force: true });
//     for (const optionText of options) {
//         await page.keyboard.type(optionText);
//         const option = optionByText(page, optionText);
//         const found = await option
//             .waitFor({ state: "attached", timeout: 2000 })
//             .then(() => true)
//             .catch(() => false);
//         if (found) {
//             await option.evaluate((el) => (el as HTMLElement).click());
//             return;
//         }
//     }
// }

// import { Locator, Page } from "@playwright/test";

// const optionByText = (page: Page, text: string) =>
//     page.getByText(new RegExp(`^ ${text} $`, "i")).last();

// export async function selectAntOption(page: Page, combobox: Locator, optionText: string) {
//     await combobox.scrollIntoViewIfNeeded();
//     await combobox.click({ force: true });
//     await combobox.pressSequentially(optionText);
//     await optionByText(page, optionText).evaluate((el) => (el as HTMLElement).click());
// }

// export async function selectAntOptionFromList(page: Page, combobox: Locator, options: string[]) {
//     await combobox.scrollIntoViewIfNeeded();
//     await combobox.click({ force: true });
//     for (const optionText of options) {
//         await combobox.pressSequentially(optionText);
//         const option = optionByText(page, optionText);
//         if (await option.count()) {
//             await option.evaluate((el) => (el as HTMLElement).click());
//             return;
//         }
//     }
// }


// import { Locator, Page } from "@playwright/test";

// export async function selectAntOption(page: Page, combobox: Locator, optionText: string) {
//     await combobox.scrollIntoViewIfNeeded();
//     await combobox.click({ force: true });
//     await combobox.pressSequentially(optionText);
//     await page.getByText(optionText, { exact: true }).last().evaluate((el) => (el as HTMLElement).click());
// }

// export async function selectAntOptionFromList(page: Page, combobox: Locator, options: string[]) {
//     await combobox.scrollIntoViewIfNeeded();
//     await combobox.click({ force: true });
//     for (const optionText of options) {
//         await combobox.pressSequentially(optionText);
//         const option = page.getByText(optionText, { exact: true }).last();
//         if (await option.count()) {
//             await option.evaluate((el) => (el as HTMLElement).click());
//             return;
//         }
//     }
// }
