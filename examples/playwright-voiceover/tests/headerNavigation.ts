import { Page } from "@playwright/test";
import { log } from "../../log";
import type { VoiceOverPlaywright } from "../../../src";

const MAX_NAVIGATION_LOOP = 10;

export async function headerNavigation({
  page,
  voiceOver,
}: {
  page: Page;
  voiceOver: VoiceOverPlaywright;
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
  await voiceOver.navigateToWebContent();

  let headingCount = 0;

  // Move across the page menu to the Guidepup heading using VoiceOver
  while (
    (await voiceOver.itemText()) !== "Guidepup heading level 1" &&
    headingCount <= MAX_NAVIGATION_LOOP
  ) {
    headingCount++;

    log(`Performing command: "VO+Command+H"`);
    await voiceOver.perform(voiceOver.keyboardCommands.findNextHeading);
    log(`Screen reader output: "${await voiceOver.lastSpokenPhrase()}".`);
  }
}
