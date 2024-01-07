import { test } from "@playwright/test";
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
const MAX_NAVIGATE_TO_WEB_CONTENT_RETRY_COUNT = 10;

const SWITCH_APPLICATION = {
  keyCode: [WindowsKeyCodes.Tab],
  modifiers: [WindowsModifiers.Alt],
};

const MOVE_TO_TOP_OF_PAGE = {
  keyCode: [WindowsKeyCodes.Home],
  modifiers: [WindowsModifiers.Control],
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

      nvdaPlaywright.navigateToWebContent = async () => {
        // Make sure NVDA is not in focus mode.
        await nvdaPlaywright.perform(
          nvdaPlaywright.keyboardCommands.exitFocusMode
        );
        await nvdaPlaywright.lastSpokenPhrase();

        // Ensure application is brought to front and focused.
        let applicationSwitchRetryCount = 0;

        while (
          applicationSwitchRetryCount < MAX_APPLICATION_SWITCH_RETRY_COUNT
        ) {
          applicationSwitchRetryCount++;

          await nvdaPlaywright.perform(SWITCH_APPLICATION);

          const lastSpokenPhrase = await nvdaPlaywright.lastSpokenPhrase();

          if (lastSpokenPhrase.includes(applicationName)) {
            break;
          }
        }

        // Make sure NVDA is not in focus mode.
        await nvdaPlaywright.perform(
          nvdaPlaywright.keyboardCommands.toggleBetweenBrowseAndFocusMode
        );
        await nvdaPlaywright.lastSpokenPhrase();

        // Ensure the document is ready and focused.
        await page.bringToFront();
        await page.locator("body").waitFor();
        await page.locator("body").focus();

        // Navigate to the beginning of the web content.
        let navigateToWebContentRetryCount = 0;

        while (
          navigateToWebContentRetryCount <
          MAX_NAVIGATE_TO_WEB_CONTENT_RETRY_COUNT
        ) {
          navigateToWebContentRetryCount++;

          await nvdaPlaywright.next();

          const lastSpokenPhrase = await nvdaPlaywright.lastSpokenPhrase();

          if (lastSpokenPhrase.includes("web content")) {
            break;
          }
        }

        await nvdaPlaywright.perform(MOVE_TO_TOP_OF_PAGE);
        await nvdaPlaywright.lastSpokenPhrase();

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
