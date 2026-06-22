import { test } from "@playwright/test";
import { voiceOver, macOSActivate, MacOSKeyCodes } from "@guidepup/guidepup";
import type { CommandOptions, VoiceOver } from "@guidepup/guidepup";
import { applicationNameMap } from "./applicationNameMap";

/**
 * [API Reference](https://www.guidepup.dev/docs/api/class-voiceover)
 *
 * This object can be used to launch and control VoiceOver.
 *
 * Here's a typical example:
 *
 * ```ts
 * import { voiceOver } from "@guidepup/guidepup";
 *
 * (async () => {
 *   // Start VoiceOver.
 *   await voiceOver.start();
 *
 *   // Move to the next item.
 *   await voiceOver.next();
 *
 *   // ... perform some commands.
 *
 *   // Stop VoiceOver.
 *   await voiceOver.stop();
 * })();
 * ```
 */
export interface VoiceOverPlaywright extends VoiceOver {
  /**
   * Guidepup Playwright specific command that navigates VoiceOver to the beginning
   * of the browser's web content.
   *
   * This command should be used after a page navigation has completed.
   *
   * Note: this command clears all logs by default.
   */
  navigateToWebContent(clearLogs?: boolean): Promise<void>;
}

const voiceOverPlaywright: VoiceOverPlaywright =
  voiceOver as VoiceOverPlaywright;

/**
 * These tests extend the default Playwright environment that launches the
 * browser with a running instance of the VoiceOver screen reader for MacOS.
 *
 * A fresh started VoiceOver instance `voiceOver` is provided to each test.
 */
export const voiceOverTest = test.extend<{
  /**
   * [API Reference](https://www.guidepup.dev/docs/api/class-voiceover)
   *
   * This object can be used to launch and control VoiceOver.
   *
   * Here's a typical example:
   *
   * ```ts
   * import { voiceOver } from "@guidepup/guidepup";
   *
   * (async () => {
   *   // Start VoiceOver.
   *   await voiceOver.start();
   *
   *   // Move to the next item.
   *   await voiceOver.next();
   *
   *   // ... perform some commands.
   *
   *   // Stop VoiceOver.
   *   await voiceOver.stop();
   * })();
   * ```
   */
  voiceOver: VoiceOverPlaywright;
  /**
   * [API Reference](https://www.guidepup.dev/docs/api/class-command-options)
   *
   * Options to start VoiceOver with, see also [voiceOver.start([options])](https://www.guidepup.dev/docs/api/class-voiceover#voiceover-start).
   */
  voiceOverStartOptions: CommandOptions;
}>({
  voiceOverStartOptions: { capture: "initial" },
  voiceOver: async ({ browserName, page, voiceOverStartOptions }, use) => {
    try {
      const applicationName = applicationNameMap[browserName];

      if (!applicationName) {
        throw new Error(`Browser ${browserName} is not installed.`);
      }

      voiceOverPlaywright.navigateToWebContent = async (
        clearLogs: boolean = true,
      ) => {
        // Ensure application is brought to front and focused.
        await macOSActivate(applicationName);

        // Cancel auto navigation
        await voiceOverPlaywright.perform({ keyCode: MacOSKeyCodes.Control });

        // Ensure the document is ready and focused.
        await page.bringToFront();
        await page.locator("body").waitFor();

        // Open the web item chooser.
        await voiceOverPlaywright.perform(
          voiceOverPlaywright.keyboardCommands.openItemChooser,
        );

        // Filter by "web content" - currently web content items for all browsers
        // are suffixed by "web content".
        await voiceOverPlaywright.type("web content");

        // Select the web content window spot.
        await voiceOverPlaywright.perform({ keyCode: MacOSKeyCodes.Enter });

        // Navigate into web content.
        await voiceOverPlaywright.interact();

        // Navigate to the beginning of the web content.
        await voiceOverPlaywright.perform(
          voiceOverPlaywright.keyboardCommands.moveToBeginningOfText,
        );

        // Cancel auto navigation
        await voiceOverPlaywright.perform({ keyCode: MacOSKeyCodes.Control });

        if (clearLogs) {
          // Clear out logs.
          await voiceOverPlaywright.clearItemTextLog();
          await voiceOverPlaywright.clearSpokenPhraseLog();
        }
      };

      await voiceOverPlaywright.start(voiceOverStartOptions);
      await use(voiceOverPlaywright);
    } finally {
      try {
        await voiceOverPlaywright.stop();
      } catch {
        // swallow stop failure
      }
    }
  },
});
