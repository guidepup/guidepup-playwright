import { test } from "@playwright/test";
import { nvda, WindowsKeyCodes, WindowsModifiers } from "@guidepup/guidepup";
import type { CommandOptions, NVDA } from "@guidepup/guidepup";
import { applicationNameMap } from "./applicationNameMap";

type Prettify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

type CaptureCommandOptions = Prettify<Pick<CommandOptions, "capture">>;

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

const MOVE_TO_TOP = {
  keyCode: [WindowsKeyCodes.Home],
  modifiers: [WindowsModifiers.Control],
};

const focusBrowser = async ({
  applicationName,
}: {
  applicationName: string;
}) => {
  await nvdaPlaywright.perform(nvdaPlaywright.keyboardCommands.reportTitle);
  let windowTitle = await nvdaPlaywright.lastSpokenPhrase();

  if (windowTitle.includes(applicationName)) {
    return;
  }

  let applicationSwitchRetryCount = 0;

  while (applicationSwitchRetryCount < MAX_APPLICATION_SWITCH_RETRY_COUNT) {
    applicationSwitchRetryCount++;

    await nvdaPlaywright.perform(SWITCH_APPLICATION);
    await nvdaPlaywright.perform(nvdaPlaywright.keyboardCommands.reportTitle);
    windowTitle = await nvdaPlaywright.lastSpokenPhrase();

    if (windowTitle.includes(applicationName)) {
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
  /**
   * [API Reference](https://www.guidepup.dev/docs/api/class-command-options)
   *
   * Options to start NVDA with, see also [nvda.start([options])](https://www.guidepup.dev/docs/api/class-nvda#nvda-start).
   */
  nvdaStartOptions: CaptureCommandOptions;
}>({
  nvda: async ({ browserName, page, nvdaStartOptions }, use) => {
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

        // Ensure application is brought to front and focused.
        await focusBrowser({ applicationName });

        // NVDA appears to not work well with Firefox when switching between
        // applications resulting in the entire browser window having NVDA focus
        // with focus mode.
        //
        // One workaround is to tab to the next focusable item. From there we can
        // toggle into (yes although we are already in it...) focus mode and back
        // out. In case this ever transpires to not happen as expect, we then ensure
        // we exit focus mode and move NVDA to the top of the page.
        //
        // REF: https://github.com/nvaccess/nvda/issues/5758
        await nvdaPlaywright.perform(
          nvdaPlaywright.keyboardCommands.readNextFocusableItem
        );
        await nvdaPlaywright.perform(
          nvdaPlaywright.keyboardCommands.toggleBetweenBrowseAndFocusMode
        );
        await nvdaPlaywright.perform(
          nvdaPlaywright.keyboardCommands.toggleBetweenBrowseAndFocusMode
        );
        await nvdaPlaywright.perform(
          nvdaPlaywright.keyboardCommands.exitFocusMode
        );
        await nvdaPlaywright.perform(MOVE_TO_TOP);

        // Clear out logs.
        await nvdaPlaywright.clearItemTextLog();
        await nvdaPlaywright.clearSpokenPhraseLog();
      };

      await nvdaPlaywright.start(nvdaStartOptions);

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
