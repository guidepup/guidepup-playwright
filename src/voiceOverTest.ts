import { test } from "@playwright/test";
import { voiceOver, macOSActivate } from "@guidepup/guidepup";
import type { VoiceOver } from "@guidepup/guidepup";
import { applicationNameMap } from "./applicationNameMap";

/**
 * These tests extend the default Playwright environment that launches the
 * browser with a running instance of the VoiceOver screen reader for MacOS.
 *
 * A fresh started VoiceOver instance `voiceOver` is provided to each test.
 */
export const voiceOverTest = test.extend<{ voiceOver: VoiceOver }>({
  voiceOver: async ({ browserName }, use) => {
    try {
      const applicationName = applicationNameMap[browserName];

      if (!applicationName) {
        throw new Error(`Browser ${browserName} is not installed.`);
      }

      await voiceOver.start();

      await macOSActivate(applicationName);

      await voiceOver.clearItemTextLog();
      await voiceOver.clearSpokenPhraseLog();

      await use(voiceOver);
    } finally {
      try {
        await voiceOver.stop();
      } catch {
        // swallow stop failure
      }
    }
  },
});
