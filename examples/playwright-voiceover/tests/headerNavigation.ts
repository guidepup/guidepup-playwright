import type { VoiceOver } from "@guidepup/guidepup";
import { Page } from "@playwright/test";
import { delay } from "../../delay";
import { log } from "../../log";

const MAX_NAVIGATION_LOOP = 10;

export async function headerNavigation({
  page,
  voiceOver,
}: {
  page: Page;
  voiceOver: VoiceOver;
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

  // Make sure interacting with the web content
  log(`Performing command: "VO+Shift+Down Arrow"`);
  await voiceOver.interact();
  log(`Screen reader output: "${await voiceOver.lastSpokenPhrase()}".`);

  // Prevent auto-navigation of group
  log(`Performing command: "VO+Shift+Left Arrow"`);
  await voiceOver.perform(voiceOver.keyboardCommands.jumpToLeftEdge);
  log(`Screen reader output: "${await voiceOver.lastSpokenPhrase()}".`);

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
