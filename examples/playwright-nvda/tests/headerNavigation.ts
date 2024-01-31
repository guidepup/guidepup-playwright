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
  // Navigate to Guidepup Website 🎉
  log("Navigating to URL: https://www.guidepup.dev.");
  await page.goto("https://www.guidepup.dev", {
    waitUntil: "load",
  });

  // Wait for page to be ready and interact 🙌
  const header = page.locator("h1");
  await header.waitFor();

  // Make sure interacting with the web content
  await nvda.navigateToWebContent();

  let headingCount = 0;

  // Move across the headings using NVDA 🔎
  while (
    !(await nvda.lastSpokenPhrase()).includes("Framework Agnostic") &&
    headingCount <= MAX_NAVIGATION_LOOP
  ) {
    headingCount++;

    log(`Performing command: "H" - "Move to next heading"`);
    await nvda.perform(nvda.keyboardCommands.moveToNextHeading);
    log(`Screen reader output: "${await nvda.lastSpokenPhrase()}".`);
  }
}
