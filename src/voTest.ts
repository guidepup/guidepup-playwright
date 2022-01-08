/* eslint-disable no-empty-pattern */
import { test } from "@playwright/test";
import { VoiceOver, macOSActivate } from "@guidepup/guidepup";

const PLAYWRIGHT_APPLICATION = "Playwright";

/**
 * These tests extend the default Playwright environment that launches the
 * browser with a running instance of the VoiceOver screen-reader for MacOS.
 *
 * A fresh started VoiceOver instance `vo` is provided to each test.
 */
const voTest = test.extend<{ vo: VoiceOver }>({
  vo: async ({}, use) => {
    const vo = new VoiceOver();

    try {
      await vo.start();
      await macOSActivate(PLAYWRIGHT_APPLICATION);
      await use(vo);
    } finally {
      vo.stopLog();
      await vo.stop();
    }
  },
});

export { voTest };
