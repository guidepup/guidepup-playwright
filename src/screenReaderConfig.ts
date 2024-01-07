import { PlaywrightTestConfig } from "@playwright/test";

export type ScreenReaderPlaywrightTestConfig = PlaywrightTestConfig;

/**
 * Minimal required configuration for Screen Reader tests in Playwright.
 */
export const screenReaderConfig: ScreenReaderPlaywrightTestConfig = {
  /**
   * We can only run a single instance of Screen Readers, so we must run a
   * single test at a time.
   */
  workers: 1,

  /**
   * We can't parallelize Screen Reader tests as they are singletons, you can't
   * start multiple instances at once.
   */
  fullyParallel: false,

  use: {
    /**
     * Screen Readers don't work against headless browsers.
     */
    headless: false,
  },
};
