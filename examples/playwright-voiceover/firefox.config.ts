import { devices, PlaywrightTestConfig } from "@playwright/test";
import { screenReaderConfig } from "../../src";

const config: PlaywrightTestConfig = {
  ...screenReaderConfig,
  reportSlowTests: null,
  timeout: 5 * 60 * 1000,
  retries: 5,
  projects: [
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], headless: false },
    },
  ],
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
};

export default config;
