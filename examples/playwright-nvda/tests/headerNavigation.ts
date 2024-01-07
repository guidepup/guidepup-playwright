import { Page } from "@playwright/test";
import { log } from "../../log";
import type { NVDAPlaywright } from "../../../src";

const MAX_NAVIGATION_LOOP = 10;

export async function headerNavigation({
  page,
  nvda,
}: {
  page: Page;
  nvda: NVDAPlaywright;
}) {
  // Navigate to Guidepup GitHub page
  log("Navigating to URL: https://github.com/guidepup/guidepup.");
  await page.goto("https://github.com/guidepup/guidepup", {
    waitUntil: "load",
  });

  // Wait for page to be ready and interact
  const header = page.locator('header[role="banner"]');
  await header.waitFor();

  // Make sure interacting with the web content
  await nvda.navigateToWebContent();

  let headingCount = 0;

  // Move across the page menu to the Guidepup heading using NVDA
  while (
    !(await nvda.lastSpokenPhrase()).includes("Guidepup, heading, level 1") &&
    headingCount <= MAX_NAVIGATION_LOOP
  ) {
    headingCount++;

    log(`Performing command: "H"`);
    await nvda.perform(nvda.keyboardCommands.moveToNextHeading);
    log(`Screen reader output: "${await nvda.lastSpokenPhrase()}".`);
  }
}
