import { expect } from "@playwright/test";
import snapshot from "./webkit.snapshot.json";
import { voTest as test } from "../../src";

test.describe("Playwright VoiceOver", () => {
  test("I can navigate the Guidepup Github page", async ({
    browserName,
    page,
    voiceOver,
  }) => {
    test.skip(browserName !== "webkit", "Webkit only test");

    // Navigate to Guidepup GitHub page 🎉
    await page.goto("https://github.com/guidepup/guidepup", {
      waitUntil: "domcontentloaded",
    });

    // Wait for page to be ready and interact 🙌
    await expect(page.locator('header[role="banner"]')).toBeVisible();
    await voiceOver.interact();

    // Move across the page menu to the Guidepup heading using VoiceOver 🔎
    while ((await voiceOver.itemText()) !== "Guidepup heading level 1") {
      await voiceOver.perform(voiceOver.keyboard.commands.findNextHeading);
    }

    // Assert that we've ended up where we expected and what we were told on
    // the way there is as expected.
    const spokenPhraseLog = await voiceOver.spokenPhraseLog();

    for (const expectedPhrase of snapshot) {
      expect(spokenPhraseLog.find(log => log.includes(expectedPhrase))).toBe(true);
    }
  });
});
