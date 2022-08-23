import { voTest as test } from "../src/index";
import { expect } from "@playwright/test";

test.describe("Playwright VoiceOver", () => {
  test("I can navigate the Playwright website using VoiceOver", async ({
    page,
    voiceOver,
  }) => {
    // Navigate to Playwright website 🎉
    await page.goto("https://playwright.dev/", {
      waitUntil: "domcontentloaded",
    });

    // Interact with the page 🙌
    await voiceOver.interact();

    // Move across the navigation menu to the search bar using VoiceOver 🔎
    while (!(await voiceOver.lastSpokenPhrase())?.startsWith("Search")) {
      await voiceOver.next();
    }

    // Search for Safari 👀
    await voiceOver.type("Safari");
    await voiceOver.press("ArrowDown");
    await voiceOver.press("ArrowUp");
    await Promise.all([page.waitForNavigation(), voiceOver.act()]);
    expect(page.url()).toBe("https://playwright.dev/docs/browsers#webkit");
  });
});
