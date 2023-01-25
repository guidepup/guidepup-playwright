<h1 align="center">Guidepup Playwright</h1>
<p align="center">
  <i>Screen reader driver for Playwright tests.</i>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@guidepup/playwright"><img alt="@guidepup/playwright available on NPM" src="https://img.shields.io/npm/v/@guidepup/playwright" /></a>
  <a href="https://github.com/guidepup/guidepup-playwright/actions/workflows/test.yml"><img alt="@guidepup/playwright test workflows" src="https://github.com/guidepup/guidepup-playwright/workflows/Test/badge.svg" /></a>
  <a href="https://github.com/guidepup/guidepup-playwright/blob/main/LICENSE"><img alt="@guidepup/playwright uses the MIT license" src="https://img.shields.io/github/license/guidepup/guidepup-playwright" /></a>
</p>
<p align="center">
  Reliable automation for your screen reader a11y workflows in Playwright supporting:
</p>
<p align="center">
  <a href="https://www.guidepup.dev/docs/api/class-voiceover"><b>VoiceOver on MacOS</b></a>
</p>
<p align="center">
  <b>NVDA on Windows</b> - <a href="https://github.com/guidepup/guidepup/pull/33">Coming Soon!</a>
</p>

## Intro

A11y static analysis tools [only cover 25% of WCAG](https://karlgroves.com/web-accessibility-testing-what-can-be-tested-and-how/) and don't assure on the quality of the user experience for screen reader users. This means teams need to perform lots of manual tests with multiple screen readers to ensure great UX which can take a lot of time... **not anymore!**

With [Guidepup](https://www.guidepup.dev/) you can automate your screen reader test workflows the same you as would for mouse or keyboard based scenarios, no sweat!

## Quick Features

- **Full Control** - if a screen reader has a keyboard command, then Guidepup supports it.
- **Mirrors Real User Experience** - assert on what users really do and hear when using screen readers.
- **Framework Agnostic** - run with Jest, with Playwright, as an independent script, no vendor lock-in.

## Getting Started

Set up your environment for screen reader automation with [`@guidepup/setup`](https://github.com/guidepup/setup):

```console
npx @guidepup/setup
```

Install `@guidepup/playwright` to your project:

```bash
npm install --save-dev @guidepup/playwright @playwright/test
```

And get cracking with your first screen reader tests in Playwright!

```ts
import { voTest as test } from "@guidepup/playwright";
import { expect } from "@playwright/test";

test.describe("Playwright VoiceOver", () => {
  test("I can navigate the Guidepup Github page", async ({
    page,
    voiceOver,
  }) => {
    // Navigate to Guidepup GitHub page
    await page.goto("https://github.com/guidepup/guidepup", {
      waitUntil: "domcontentloaded",
    });

    // Wait for page to be ready and interact
    await expect(page.locator('header[role="banner"]')).toBeVisible();
    await voiceOver.interact();

    // Move across the page menu to the Guidepup heading using VoiceOver
    while ((await voiceOver.itemText()) !== "Guidepup heading level 1") {
      await voiceOver.perform(voiceOver.keyboard.commands.findNextHeading);
    }
});
```

## Playwright Config

In your `playwright.config.ts` add the following for the best results with
Guidepup for VoiceOver automation.

```ts
import { devices, PlaywrightTestConfig } from "@playwright/test";
import { voConfig } from "@guidepup/playwright";

const config: PlaywrightTestConfig = {
  ...voConfig,
  
  // Your custom config ...
};

export default config;
```

Check out the configuration this adds [in the voConfig.ts file](./src/voConfig.ts).

## Environment Setup

Set up your environment for screen-read automation with [`@guidepup/setup`](https://github.com/guidepup/setup):

```bash
npx @guidepup/setup
```

If you are using GitHub Actions, check out the dedicated [`guidepup/setup-action`](https://github.com/marketplace/actions/guidepup-setup):

```yaml
- name: Setup Environment
  uses: guidepup/setup-action@0.8.1
```

## Documentation

Head over to the [Guidepup Website](https://www.guidepup.dev/) for guides, real world examples, environment setup, and complete Guidepup API documentation with examples.

## Example

Check out [this cross-browser VoiceOver example](./example/).

## See Also

Checkout the core [`@guidepup/guidepup`](https://github.com/guidepup/guidepup)
project to learn more about how you can automate your screen reader workflows
using Guidepup.

## License

[MIT](https://github.com/guidepup/guidepup/blob/main/LICENSE)
