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
  // Navigate to Guidepup Website 🎉
  log("Navigating to URL: https://www.guidepup.dev.");
  await page.goto("https://www.guidepup.dev", {
    waitUntil: "load",
  });

  // Wait for page to be ready and interact 🙌
  const header = page.locator("h1");
  await header.waitFor();

  // Make sure interacting with the web content
  await voiceOver.navigateToWebContent();

  let headingCount = 0;

  // Move across the headings using VoiceOver 🔎
  while (
    !(await voiceOver.itemText()).includes("Framework Agnostic") &&
    headingCount <= MAX_NAVIGATION_LOOP
  ) {
    headingCount++;

    // Navigate to the next heading
    log(`Performing command: "VO+Command+H" - "Find the next heading"`);
    await voiceOver.perform(voiceOver.keyboardCommands.findNextHeading);
    log(`Screen reader output: "${await voiceOver.lastSpokenPhrase()}".`);

    // Describe the item in the VoiceOver cursor as it can sometimes skip part
    // of the spoken phrase if interrupted.
    log(
      `Performing command: "VO+F3" - "Describe the item in the VoiceOver cursor"`
    );
    await voiceOver.perform(voiceOver.keyboardCommands.describeItem);
    log(`Screen reader output: "${await voiceOver.lastSpokenPhrase()}".`);
  }
}
