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

## Getting Started 🦮

Install `@guidepup/playwright` to your project:

```bash
npm install --save-dev @guidepup/playwright
```

And get cracking with your first screen-reader tests in Playwright! 🚀

```ts
import { voTest as test } from "@guidepup/playwright";
import { expect } from "@playwright/test";

test.describe("Playwright VoiceOver", () => {
  test("I can navigate the Guidepup Github page", async ({
    page,
    voiceOver,
  }) => {
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
});
```

## Playwright Config 🐕‍🦺

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

Check out the configuration this adds [in the voConfig.ts file](./src/voConfig.ts). 👀

## Environment Setup 🐾

Setup your environment for screen-read automation with [`@guidepup/setup`](https://github.com/guidepup/setup):

```bash
npx @guidepup/setup
```

If you are using GitHub Actions, check out the dedicated [`guidepup/setup-action`](https://github.com/marketplace/actions/guidepup-setup):

```yaml
- name: Setup Environment
  uses: guidepup/setup-action@0.1.3
```

## Example 👀

Check out [this VoiceOver example](./example/README.md).

## See Also 🐶

Checkout the core [`@guidepup/guidepup`](https://github.com/guidepup/guidepup)
project to learn more about how you can automate your screen-reader workflows
using Guidepup.

## License 🐩

[MIT](https://github.com/guidepup/guidepup/blob/main/LICENSE)
