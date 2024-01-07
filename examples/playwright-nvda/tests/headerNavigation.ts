import type { NVDA } from "@guidepup/guidepup";
import { Page } from "@playwright/test";
import { delay } from "../../delay";
import { log } from "../../log";

const MAX_NAVIGATION_LOOP = 10;

export async function headerNavigation({
  page,
  nvda,
}: {
  page: Page;
  nvda: NVDA;
}) {
  // Navigate to Guidepup GitHub page
  log("Navigating to URL: https://github.com/guidepup/guidepup.");
  await page.goto("https://github.com/guidepup/guidepup", {
    waitUntil: "load",
  });

  // Wait for page to be ready and interact
  const header = page.locator('header[role="banner"]');
  await header.waitFor();
  await delay(500);
  await page.locator("a").first().focus();

  // Make sure not in focus mode
  log(`Performing command: "Escape"`);
  await nvda.perform(nvda.keyboardCommands.exitFocusMode);
  log(`Screen reader output: "${await nvda.lastSpokenPhrase()}".`);

  let headingCount = 0;

  // Move across the page menu to the Guidepup heading using NVDA
  while (
    (await nvda.itemText()) !== "Guidepup heading level 1" &&
    headingCount <= MAX_NAVIGATION_LOOP
  ) {
    headingCount++;

    log(`Performing command: "VO+Command+H"`);
    await nvda.perform(nvda.keyboardCommands.moveToNextHeading);
    log(`Screen reader output: "${await nvda.lastSpokenPhrase()}".`);
  }
}
