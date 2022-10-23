import { devices, PlaywrightTestConfig } from "@playwright/test";
import { voConfig } from "../src";

const config: PlaywrightTestConfig = {
  ...voConfig,
  reportSlowTests: null,
  workers: 1,
  timeout: 2 * 60 * 1000,
  retries: 3,
  projects: [
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], headless: false, video: "on" },
    },
  ],
};

export default config;
