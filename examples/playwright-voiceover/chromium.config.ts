import { devices } from "@playwright/test";
import { withGuidepup } from "../../src";

const config = withGuidepup({
  reportSlowTests: null,
  timeout: 5 * 60 * 1000,
  retries: 5,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
});

export default config;
