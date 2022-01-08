<h1 align="center">Guidepup Playwright</h1>
<p align="center">
  <i>Screen-reader driver for Playwright.</i>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@guidepup/playwright"><img alt="@guidepup/playwright available on NPM" src="https://img.shields.io/npm/v/@guidepup/playwright" /></a>
  <a href="https://github.com/guidepup/guidepup-playwright/actions/workflows/test.yml"><img alt="@guidepup/playwright test workflows" src="https://github.com/guidepup/guidepup-playwright/workflows/Test/badge.svg" /></a>
  <a href="https://github.com/guidepup/guidepup-playwright/blob/main/LICENSE"><img alt="@guidepup/playwright uses the MIT license" src="https://img.shields.io/github/license/guidepup/guidepup-playwright" /></a>
</p>
<p align="center">
  Providing a reliable set of APIs to automate your screen-reader a11y workflows in Playwright.
</p>

## Getting Started

Install `@guidepup/playwright` to your project:

```bash
npm install --save-dev @guidepup/playwright
```

And get cracking with your first screen-reader tests in Playwright! 🚀

```ts
import { voTest as test } from "@guidepup/playwright";
import { expect } from "@playwright/test";

test.describe("Playwright VoiceOver", () => {
  test("I can navigate the Playwright website using VoiceOver", async ({
    page,
    vo,
  }) => {
    // Navigate to Playwright website 🎉
    await page.goto("https://playwright.dev/", {
      waitUntil: "domcontentloaded",
    });

    // Interact with the page 🙌
    await vo.commandInteractWithItem();

    // Move across the navigation menu to the search bar using VoiceOver 🔎
    while (!(await vo.getLastSpokenPhrase())?.startsWith("Search")) {
      await vo.moveNext();
    }

    // Search for Safari 👀
    await page.keyboard.type("Safari");
    await vo.performAction();
    expect(page.url()).toBe("https://playwright.dev/docs/browsers#webkit");
  });
});
```

## Playwright Config

In your `playwright.config.ts` add the following for the best results with
Guidepup for VoiceOver automation. 💥

```ts
import { devices, PlaywrightTestConfig } from "@playwright/test";
import { voConfig } from "@guidepup/playwright";

const config: PlaywrightTestConfig = {
  ...voConfig,
  
  // Your custom config ...
};

export default config;
```

Check out the configuration this adds [here](./src/voConfig.ts). 👀

## Resources

Checkout the core [@guidepup/guidepup](https://github.com/guidepup/guidepup)
project to learn more about how you can automate your screen-reader workflows
using Guidepup.

## License

[MIT](https://github.com/guidepup/guidepup/blob/main/LICENSE)
