import type { VoiceOver } from "@guidepup/guidepup";
import { Page } from "@playwright/test";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_NAVIGATION_LOOP = 10;

export async function headerNavigation({
  page,
  voiceOver,
}: {
  page: Page;
  voiceOver: VoiceOver;
}) {
  // Navigate to Guidepup GitHub page 🎉
  await page.goto("https://github.com/guidepup/guidepup", {
    waitUntil: "domcontentloaded",
  });

  // Wait for page to be ready and interact 🙌
  const header = page.locator('header[role="banner"]');
  await header.waitFor();
  await delay(500);

  // Make sure interacting with the web content
  await voiceOver.interact();

  // Prevent auto-navigation of group
  await voiceOver.perform(voiceOver.keyboardCommands.jumpToLeftEdge);

  let headingCount = 0;

  // Move across the page menu to the Guidepup heading using VoiceOver 🔎
  while (
    (await voiceOver.itemText()) !== "Guidepup heading level 1" &&
    headingCount <= MAX_NAVIGATION_LOOP
  ) {
    headingCount++;
    await voiceOver.perform(voiceOver.keyboardCommands.findNextHeading);
  }
}
