import { test } from "@playwright/test";
import {
  CommandOptions,
  macOSActivate,
  MacOSKeyCodes,
  nvda,
  NVDAKeyCodeCommands,
  screenReader,
  type ScreenReader,
  voiceOver,
  voiceOverKeyCodeCommands,
  WindowsKeyCodes,
  WindowsModifiers,
} from "@guidepup/guidepup";
import { applicationNameMap } from "./applicationNameMap";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type CaptureCommandOptions = Prettify<Pick<CommandOptions, "capture">>;

const MAX_APPLICATION_SWITCH_RETRY_COUNT = 10;

const SWITCH_APPLICATION = {
  keyCode: [WindowsKeyCodes.Escape],
  modifiers: [WindowsModifiers.Alt],
};

const MOVE_TO_TOP = {
  keyCode: [WindowsKeyCodes.Home],
  modifiers: [WindowsModifiers.Control],
};

type FocusBrowserParams = {
  applicationName: string;
  pageTitle: string;
};

const cleanString = (str: string): string =>
  str
    .toLowerCase()
    // REF: https://github.com/nvaccess/nvda/blob/master/source/locale/en/symbols.dic
    .replace(/[|¦:;'"`\-‐–—·_()[\]{}\\^~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasFocus = ({
  applicationName,
  pageTitle,
  windowTitle,
}: FocusBrowserParams & { windowTitle: string }) => {
  const cleanedApplicationName = cleanString(applicationName);
  const cleanedPageTitle = cleanString(pageTitle);
  const cleanedWindowTitle = cleanString(windowTitle);

  return (
    (cleanedPageTitle.length &&
      cleanedWindowTitle.startsWith(cleanedPageTitle)) ||
    cleanedWindowTitle.includes(cleanedApplicationName)
  );
};

const focusBrowser = async ({
  applicationName,
  pageTitle,
}: {
  applicationName: string;
  pageTitle: string;
}) => {
  await screenReaderPlaywright.perform(NVDAKeyCodeCommands.reportTitle);
  let windowTitle = await screenReaderPlaywright.lastSpokenPhrase();

  if (hasFocus({ applicationName, pageTitle, windowTitle })) {
    return;
  }

  let applicationSwitchRetryCount = 0;

  while (applicationSwitchRetryCount < MAX_APPLICATION_SWITCH_RETRY_COUNT) {
    applicationSwitchRetryCount++;

    await screenReaderPlaywright.perform(SWITCH_APPLICATION);
    await screenReaderPlaywright.perform(NVDAKeyCodeCommands.reportTitle);
    windowTitle = await screenReaderPlaywright.lastSpokenPhrase();

    if (hasFocus({ applicationName, pageTitle, windowTitle })) {
      break;
    }
  }
};

/**
 * This object can be used to launch and control the default screen reader for
 * the environment.
 *
 * Here's a typical example:
 *
 * ```ts
 * import { screenReader } from "@guidepup/guidepup";
 *
 * (async () => {
 *   // Start the screen reader.
 *   await screenReader.start();
 *
 *   // Move to the next item.
 *   await screenReader.next();
 *
 *   // ... perform some commands.
 *
 *   // Stop the screen reader.
 *   await screenReader.stop();
 * })();
 * ```
 */
export interface ScreenReaderPlaywright extends ScreenReader {
  /**
   * Guidepup Playwright specific command that navigates the screen reader to
   * the beginning of the browser's web content.
   *
   * This command should be used after page navigation.
   *
   * Note: this command clears all logs by default.
   */
  navigateToWebContent(clearLogs?: boolean): Promise<void>;
}

const screenReaderPlaywright: ScreenReaderPlaywright =
  screenReader as ScreenReaderPlaywright;

/**
 * These tests extend the default Playwright environment that launches the
 * browser with a running instance of the default screen reader for the current
 * OS.
 *
 * A fresh started screen reader instance `screenReader` is provided to each
 * test.
 */
export const screenReaderTest = test.extend<{
  /**
   * This object can be used to launch and control the default screen reader for
   * the environment.
   *
   * Here's a typical example:
   *
   * ```ts
   * import { screenReader } from "@guidepup/guidepup";
   *
   * (async () => {
   *   // Start the screen reader.
   *   await screenReader.start();
   *
   *   // Move to the next item.
   *   await screenReader.next();
   *
   *   // ... perform some commands.
   *
   *   // Stop the screen reader.
   *   await screenReader.stop();
   * })();
   * ```
   */
  screenReader: ScreenReaderPlaywright;
  /**
   * Options to start the default screen reader with.
   */
  screenReaderStartOptions: CaptureCommandOptions;
}>({
  screenReaderStartOptions: { capture: "initial" },
  screenReader: async (
    { browserName, page, screenReaderStartOptions },
    use,
  ) => {
    try {
      const applicationName = applicationNameMap[browserName];

      if (!applicationName) {
        throw new Error(`Browser ${browserName} is not installed.`);
      }

      if (nvda.default()) {
        screenReaderPlaywright.navigateToWebContent = async (
          clearLogs: boolean = true,
        ) => {
          // Make sure NVDA is not in focus mode.
          await screenReaderPlaywright.perform(
            NVDAKeyCodeCommands.exitFocusMode,
          );

          const pageTitle = await page.title();
          // Ensure application is brought to front and focused.
          await focusBrowser({ applicationName, pageTitle });

          // Ensure the document is ready and focused.
          await page.bringToFront();
          await page.locator("body").waitFor();
          await page.locator("body").focus();
          await page.locator("body").click();
          await page.locator("body").blur();

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
          await screenReaderPlaywright.perform(
            NVDAKeyCodeCommands.readNextFocusableItem,
          );
          await screenReaderPlaywright.perform(
            NVDAKeyCodeCommands.toggleBetweenBrowseAndFocusMode,
          );
          await screenReaderPlaywright.perform(
            NVDAKeyCodeCommands.toggleBetweenBrowseAndFocusMode,
          );
          await screenReaderPlaywright.perform(
            NVDAKeyCodeCommands.exitFocusMode,
          );
          await screenReaderPlaywright.perform(MOVE_TO_TOP);

          if (clearLogs) {
            // Clear out logs.
            await screenReaderPlaywright.clearItemTextLog();
            await screenReaderPlaywright.clearSpokenPhraseLog();
          }
        };
      } else if (voiceOver.default()) {
        screenReaderPlaywright.navigateToWebContent = async (
          clearLogs: boolean = true,
        ) => {
          await macOSActivate(applicationName);

          await screenReaderPlaywright.perform({
            keyCode: MacOSKeyCodes.Control,
          });

          await page.bringToFront();
          await page.locator("body").waitFor();

          await screenReaderPlaywright.perform(
            voiceOverKeyCodeCommands.openItemChooser,
          );

          await screenReaderPlaywright.type("web content");

          await screenReaderPlaywright.perform({
            keyCode: MacOSKeyCodes.Enter,
          });

          await screenReaderPlaywright.interact();

          await screenReaderPlaywright.perform(
            voiceOverKeyCodeCommands.moveToBeginningOfText,
          );

          await screenReaderPlaywright.perform({
            keyCode: MacOSKeyCodes.Control,
          });

          if (clearLogs) {
            await screenReaderPlaywright.clearItemTextLog();
            await screenReaderPlaywright.clearSpokenPhraseLog();
          }
        };
      } else {
        throw new Error("No supported screen reader");
      }

      await screenReaderPlaywright.start(screenReaderStartOptions);
      await use(screenReaderPlaywright);
    } finally {
      try {
        await screenReaderPlaywright.stop();
      } catch {
        // swallow stop failure
      }
    }
  },
});
