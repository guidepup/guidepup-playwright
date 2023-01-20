import { test } from "@playwright/test";
import { voiceOver, macOSActivate } from "@guidepup/guidepup";

const applicationNameMap = {
  chromium: "Chromium",
  chrome: "Chrome",
  "chrome-beta": "Chrome Beta",
  msedge: "",
  "msedge-beta": "",
  "msedge-dev": "",
  firefox: "Firefox",
  webkit: "Playwright",
};

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
      await macOSActivate(applicationNameMap[browserName]);
      await use(voiceOver);
    } finally {
      await voiceOver.stop();
    }
  },
});

export { voTest };
