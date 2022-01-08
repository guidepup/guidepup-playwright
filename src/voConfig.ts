import { PlaywrightTestConfig } from "@playwright/test";

export type VoiceOverPlaywrightTestConfig = PlaywrightTestConfig;

/**
 * Minimal required configuration for VoiceOver tests in Playwright.
 */
export const voConfig: VoiceOverPlaywrightTestConfig = {
  /**
   * We can only run a single instance of VoiceOver, so we must run a single
   * test at a time.
   */
  workers: 1,

  use: {
    /**
     * VoiceOver can only control headed applications.
     */
    headless: false,
  },
};
