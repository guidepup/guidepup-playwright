/* eslint-disable no-empty-pattern */
import { test } from "@playwright/test";
import { voiceOver, macOSActivate } from "@guidepup/guidepup";

/**
 * These tests extend the default Playwright environment that launches the
 * browser with a running instance of the VoiceOver screen-reader for MacOS.
 *
 * A fresh started VoiceOver instance `vo` is provided to each test.
 */
const voTest = test.extend<{ voiceOver: typeof voiceOver }>({
  voiceOver: async ({ browserName }, use) => {
    try {
      await voiceOver.start();
      await macOSActivate(browserName);
      await use(voiceOver);
    } finally {
      await voiceOver.stop();
    }
  },
});

export { voTest };
