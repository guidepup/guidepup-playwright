import { Page, test } from "@playwright/test";
import { nvda, WindowsKeyCodes, WindowsModifiers } from "@guidepup/guidepup";
import type { NVDA } from "@guidepup/guidepup";
import { applicationNameMap } from "./applicationNameMap";

/**
 * [API Reference](https://www.guidepup.dev/docs/api/class-nvda)
 *
 * This object can be used to launch and control NVDA.
 *
 * Here's a typical example:
 *
 * ```ts
 * import { nvda } from "@guidepup/guidepup";
 *
 * (async () => {
 *   // Start NVDA.
 *   await nvda.start();
 *
 *   // Move to the next item.
 *   await nvda.next();
 *
 *   // Stop NVDA.
 *   await nvda.stop();
 * })();
 * ```
 */
export interface NVDAPlaywright extends NVDA {
  /**
   * Guidepup Playwright specific command that navigates NVDA to the beginning
   * of the browser's web content.
   *
   * This command should be used after page navigation.
   *
   * Note: this command clears all logs.
   */
  navigateToWebContent(): Promise<void>;
}

const nvdaPlaywright: NVDAPlaywright = nvda as NVDAPlaywright;

const MAX_APPLICATION_SWITCH_RETRY_COUNT = 10;

const SWITCH_APPLICATION = {
  keyCode: [WindowsKeyCodes.Escape],
  modifiers: [WindowsModifiers.Alt],
};

const focusBrowser = async ({
  applicationName,
  page,
}: {
  applicationName: string;
  page: Page;
}) => {
  await nvdaPlaywright.perform(nvdaPlaywright.keyboardCommands.reportTitle);
  let windowTitle = await nvdaPlaywright.lastSpokenPhrase();

  if (windowTitle.includes(applicationName)) {
    return;
  }

  // Firefox has a bug with NVDA where NVDA gets stuck in focus mode if
  // Firefox is the currently focused application.
  // REF: https://github.com/nvaccess/nvda/issues/5758
  // We swap to a different application, restart NVDA, and then switch back.

  let applicationSwitchRetryCount = 0;

  while (applicationSwitchRetryCount < MAX_APPLICATION_SWITCH_RETRY_COUNT) {
    applicationSwitchRetryCount++;

    await nvdaPlaywright.perform(SWITCH_APPLICATION);
    await nvdaPlaywright.perform(nvdaPlaywright.keyboardCommands.reportTitle);
    windowTitle = await nvdaPlaywright.lastSpokenPhrase();

    if (!windowTitle.includes(applicationName)) {
      break;
    }
  }

  await nvdaPlaywright.stop();
  await nvdaPlaywright.start();
  await page.bringToFront();

  await nvdaPlaywright.perform(nvdaPlaywright.keyboardCommands.reportTitle);
  windowTitle = await nvdaPlaywright.lastSpokenPhrase();

  if (windowTitle.includes(applicationName)) {
    return;
  }

  applicationSwitchRetryCount = 0;

  while (applicationSwitchRetryCount < MAX_APPLICATION_SWITCH_RETRY_COUNT) {
    applicationSwitchRetryCount++;

    await nvdaPlaywright.perform(SWITCH_APPLICATION);
    await nvdaPlaywright.perform(nvdaPlaywright.keyboardCommands.reportTitle);
    windowTitle = await nvdaPlaywright.lastSpokenPhrase();

    if (!windowTitle.includes(applicationName)) {
      break;
    }
  }
};

/**
 * These tests extend the default Playwright environment that launches the
 * browser with a running instance of the NVDA screen reader for Windows.
 *
 * A fresh started NVDA instance `nvda` is provided to each test.
 */
export const nvdaTest = test.extend<{
  /**
   * [API Reference](https://www.guidepup.dev/docs/api/class-nvda)
   *
   * This object can be used to launch and control NVDA.
   *
   * Here's a typical example:
   *
   * ```ts
   * import { nvda } from "@guidepup/guidepup";
   *
   * (async () => {
   *   // Start NVDA.
   *   await nvda.start();
   *
   *   // Move to the next item.
   *   await nvda.next();
   *
   *   // Stop NVDA.
   *   await nvda.stop();
   * })();
   * ```
   */
  nvda: NVDAPlaywright;
}>({
  nvda: async ({ browserName, page }, use) => {
    try {
      const applicationName = applicationNameMap[browserName];

      if (!applicationName) {
        throw new Error(`Browser ${browserName} is not installed.`);
      }

      await page.goto("about:blank", { waitUntil: "load" });
      await page.bringToFront();

      nvdaPlaywright.navigateToWebContent = async () => {
        // Make sure NVDA is not in focus mode.
        await nvdaPlaywright.perform(
          nvdaPlaywright.keyboardCommands.exitFocusMode
        );
        await nvdaPlaywright.lastSpokenPhrase();

        // Ensure application is brought to front and focused.
        await focusBrowser({ applicationName, page });

        // Make sure NVDA is not in focus mode.
        await nvdaPlaywright.perform(
          nvdaPlaywright.keyboardCommands.exitFocusMode
        );
        await nvdaPlaywright.lastSpokenPhrase();

        // Ensure the document is ready and focused.
        await page.bringToFront();
        await page.locator("body").waitFor();
        await page.locator("body").focus();

        // Clear out logs.
        await nvdaPlaywright.clearItemTextLog();
        await nvdaPlaywright.clearSpokenPhraseLog();
      };

      await nvdaPlaywright.start();

      await use(nvdaPlaywright);
    } finally {
      try {
        await nvdaPlaywright.stop();
      } catch {
        // swallow stop failure
      }
    }
  },
});
