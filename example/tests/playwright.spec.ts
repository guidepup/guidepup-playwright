import { expect } from "@playwright/test";
import itemTextSnapshot from "./itemTextSnapshot.json";
import { voTest as test } from "../../src";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForWebContentAnnouncement(voiceOver) {
  for (let i = 0; i < 10; i++) {
    const itemText = await voiceOver.itemText();

    if (itemText?.includes("web content")) {
      return;
    }

    await delay(50);
  }

  throw new Error("web content could not be found");
}

test.describe("Playwright VoiceOver", () => {
  test("I can navigate the Playwright website to the Safari section", async ({
    page,
    voiceOver,
  }) => {
    await page.goto("https://github.com/guidepup/guidepup", {
      waitUntil: "domcontentloaded",
    });

    // Wait for page to be ready and interact.
    await expect(page.locator('header[role="banner"]')).toBeVisible();
    await waitForWebContentAnnouncement(voiceOver);
    await voiceOver.interact();

    // Let's navigate the page to the Guidepup heading in the README.
    while ((await voiceOver.itemText()) !== "Guidepup heading level 1") {
      await voiceOver.perform(voiceOver.keyboard.commands.findNextHeading);
    }

    // Assert that we've ended up where we expected and what we were told on
    // the way there is as expected.
    const itemTextLog = await voiceOver.itemTextLog();

    for (const expectedItem of itemTextSnapshot) {
      expect(itemTextLog).toContain(expectedItem);
    }
  });
});
