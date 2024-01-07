import { test } from "@playwright/test";
import { nvda, WindowsKeyCodes, WindowsModifiers } from "@guidepup/guidepup";
import type { NVDA } from "@guidepup/guidepup";
import { applicationNameMap } from "./applicationNameMap";

/**
 * These tests extend the default Playwright environment that launches the
 * browser with a running instance of the NVDA screen reader for Windows.
 *
 * A fresh started NVDA instance `nvda` is provided to each test.
 */
export const nvdaTest = test.extend<{ nvda: NVDA }>({
  nvda: async ({ browserName, page }, use) => {
    try {
      const applicationName = applicationNameMap[browserName];

      if (!applicationName) {
        throw new Error(`Browser ${browserName} is not installed.`);
      }

      await nvda.start();

      // Make sure the browser window is focused.
      await page.goto("about:blank", { waitUntil: "load" });

      let applicationSwitchRetryCount = 0;

      while (applicationSwitchRetryCount < 10) {
        applicationSwitchRetryCount++;

        await nvda.perform({
          keyCode: [WindowsKeyCodes.Tab],
          modifiers: [WindowsModifiers.Alt],
        });

        const lastSpokenPhrase = await nvda.lastSpokenPhrase();

        if (lastSpokenPhrase.includes(applicationName)) {
          break;
        }
      }

      // Make sure not in focus mode.
      await nvda.perform(nvda.keyboardCommands.exitFocusMode);

      // Clear the logs.
      await nvda.clearItemTextLog();
      await nvda.clearSpokenPhraseLog();

      await use(nvda);
    } finally {
      try {
        await nvda.stop();
      } catch {
        // swallow stop failure
      }
    }
  },
});
