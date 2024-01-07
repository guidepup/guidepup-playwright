# Guidepup Playwright

<a href="https://www.npmjs.com/package/@guidepup/playwright"><img alt="@guidepup/playwright available on NPM" src="https://img.shields.io/npm/v/@guidepup/playwright" /></a>
<a href="https://github.com/guidepup/guidepup-playwright/actions/workflows/test.yml"><img alt="@guidepup/playwright test workflows" src="https://github.com/guidepup/guidepup-playwright/workflows/Test/badge.svg" /></a>
<a href="https://github.com/guidepup/guidepup-playwright/blob/main/LICENSE"><img alt="@guidepup/playwright uses the MIT license" src="https://img.shields.io/github/license/guidepup/guidepup-playwright" /></a>

## [Documentation](https://guidepup.dev) | [API Reference](https://www.guidepup.dev/docs/api/class-guidepup)

[![MacOS Big Sur Support](https://img.shields.io/badge/macos-Big_Sur-blue.svg?logo=apple)](https://apps.apple.com/id/app/macos-big-sur/id1526878132)
[![MacOS Monetary Support](https://img.shields.io/badge/macos-Monetary-blue.svg?logo=apple)](https://apps.apple.com/us/app/macos-monterey/id1576738294)
[![MacOS Ventura Support](https://img.shields.io/badge/macos-Ventura-blue.svg?logo=apple)](https://apps.apple.com/us/app/macos-ventura/id1638787999)
[![Windows 10 Support](https://img.shields.io/badge/windows-10-blue.svg?logo=windows10)](https://www.microsoft.com/en-gb/software-download/windows10ISO)
[![Windows Server 2019 Support](https://img.shields.io/badge/windows_server-2019-blue.svg?logo=windows)](https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-2019)
[![Windows Server 2022 Support](https://img.shields.io/badge/windows_server-2022-blue.svg?logo=windows)](https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-2022)

This package provides [Guidepup](https://github.com/guidepup/guidepup) integration with [Playwright](https://playwright.dev/) for writing screen reader tests that automate <a href="https://www.guidepup.dev/docs/api/class-voiceover"><b>VoiceOver on MacOS</b></a> and <a href="https://www.guidepup.dev/docs/api/class-nvda"><b>NVDA on Windows</b></a>.

## Capabilities

- **Full Control** - If a screen reader has a keyboard command, then Guidepup supports it.
- **Mirrors Real User Experience** - Assert on what users really do and hear when using screen readers.
- **Framework Agnostic** - Run with Jest, with Playwright, as an independent script, no vendor lock-in.

## Getting Started

Set up your environment for screen reader automation with [`@guidepup/setup`](https://github.com/guidepup/setup):

```sh
npx @guidepup/setup
```

If you are using GitHub Actions, check out the dedicated [`guidepup/setup-action`](https://github.com/marketplace/actions/guidepup-setup):

```yaml
- name: Setup Environment
  uses: guidepup/setup-action
```

Install `@guidepup/playwright` to your project:

```sh
npm install --save-dev @guidepup/playwright @guidepup/guidepup @playwright/test
```

Note: you require `@guidepup/guidepup` and `@playwright/test` as they are peer dependencies to this project.

And get cracking with your first screen reader tests in Playwright!

## Examples

Head over to the [Guidepup Website](https://www.guidepup.dev/) for guides, real world examples, environment setup, and complete API documentation with examples.

You can also check out these [awesome examples](https://github.com/guidepup/guidepup/tree/main/examples) to learn how you could use Guidepup with Playwright in your projects.

Alternatively check out [this project](https://github.com/guidepup/aria-at-tests) which runs several thousand tests to assert screen reader compatibility against [W3C ARIA-AT](https://github.com/w3c/aria-at) test suite.

### Playwright Config

In your `playwright.config.ts` add the following for the best results with Guidepup for Screen Reader automation:

```ts
import { devices, PlaywrightTestConfig } from "@playwright/test";
import { screenReaderConfig } from "@guidepup/playwright";

const config: PlaywrightTestConfig = {
  ...screenReaderConfig,

  // ... your custom config
};

export default config;
```

Check out the configuration this adds [in the `config.ts`` file](./src/config.ts).

### Web Content Navigation

In addition to the Guidepup APIs the `voiceOver` and `nvda` instances provided by the Guidepup Playwright setup have an additional utility method `.navigateToWebContent()`.

This method will navigate the screen reader to the first element of the document body in the browser.

Use this method after you navigate to a page and have made any necessary checks that the page has loaded as expected. For example, this is how you might use the method with NVDA:

```ts
// Navigate to the desired page
await page.goto("https://github.com/guidepup/guidepup", {
  waitUntil: "load",
});

// Wait for page to be ready
await page.locator('header[role="banner"]').waitFor();

// Navigate to the web content
await nvda.navigateToWebContent();

// ... some commands
```

**Note:** This command clears all logs meaning `.spokenPhraseLog()` and `.itemTextLog()` are emptied. If logs from prior to the command are required, first store the logs in a variable for later use:

```ts
// ... some commands

// Store spoken phrases
const spokenPhrases = await nvda.spokenPhraseLog();

// Navigate to the web content
await nvda.navigateToWebContent();

// ... some commands

// Collect all spoken phrasees
const allSpokenPhrases = [...spokenPhrases, ...(await nvda.spokenPhraseLog())];

// ... do something with spoken phrases
```

### VoiceOver Example

`playwright.config.ts`:

```ts
import { devices, PlaywrightTestConfig } from "@playwright/test";
import { screenReaderConfig } from "@guidepup/playwright";

const config: PlaywrightTestConfig = {
  ...screenReaderConfig,
  reportSlowTests: null,
  timeout: 5 * 60 * 1000,
  retries: 2,
  projects: [
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], headless: false },
    },
  ],
};

export default config;
```

`voiceOver.spec.ts`:

```ts
import { voiceOverTest as test } from "@guidepup/playwright";
import { expect } from "@playwright/test";

test.describe("Playwright VoiceOver", () => {
  test("I can navigate the Guidepup Github page with VoiceOver", async ({
    page,
    voiceOver,
  }) => {
    // Navigate to Guidepup GitHub page
    await page.goto("https://github.com/guidepup/guidepup", {
      waitUntil: "load",
    });

    // Wait for page to be ready
    const header = page.locator('header[role="banner"]');
    await header.waitFor();

    // Interact with the page
    await voiceOver.navigateToWebContent();

    // Move across the page menu to the Guidepup heading using VoiceOver
    while ((await voiceOver.itemText()) !== "Guidepup heading level 1") {
      await voiceOver.perform(voiceOver.keyboardCommands.findNextHeading);
    }

    // Assert that the spoken phrases are as expected
    expect(JSON.stringify(await voiceOver.spokenPhraseLog())).toMatchSnapshot();
  });
});
```

### NVDA Example

`playwright.config.ts`:

```ts
import { devices, PlaywrightTestConfig } from "@playwright/test";
import { screenReaderConfig } from "@guidepup/playwright";

const config: PlaywrightTestConfig = {
  ...screenReaderConfig,
  reportSlowTests: null,
  timeout: 5 * 60 * 1000,
  retries: 2,
  projects: [
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], headless: false },
    },
  ],
};

export default config;
```

`nvda.spec.ts`:

```ts
import { nvdaTest as test } from "@guidepup/playwright";
import { expect } from "@playwright/test";

test.describe("Playwright NVDA", () => {
  test("I can navigate the Guidepup Github page with NVDA", async ({
    page,
    nvda,
  }) => {
    // Navigate to Guidepup GitHub page
    await page.goto("https://github.com/guidepup/guidepup", {
      waitUntil: "load",
    });

    // Wait for page to be ready and setup
    const header = page.locator('header[role="banner"]');
    await header.waitFor();

    // Interact with the page
    await nvda.navigateToWebContent();

    // Move across the page menu to the Guidepup heading using NVDA
    while (
      !(await nvda.lastSpokenPhrase()).includes("Guidepup, heading, level 1")
    ) {
      await nvda.perform(nvda.keyboardCommands.moveToNextHeading);
    }

    // Assert that the spoken phrases are as expected
    expect(JSON.stringify(await nvda.spokenPhraseLog())).toMatchSnapshot();
  });
});
```

## Powerful Tooling

Check out some of the other Guidepup modules:

- [`@guidepup/guidepup`](https://github.com/guidepup/guidepup/) - Reliable automation for your screen reader a11y workflows through JavaScript supporting VoiceOver and NVDA.
- [`@guidepup/setup`](https://github.com/guidepup/setup/) - Set up your local or CI environment for screen reader test automation.
- [`@guidepup/virtual-screen-reader`](https://github.com/guidepup/virtual-screen-reader/) - Reliable unit testing for your screen reader a11y workflows.
- [`@guidepup/jest`](https://github.com/guidepup/jest/) - Jest matchers for reliable unit testing of your screen reader a11y workflows.

## Resources

- [Documentation](https://www.guidepup.dev/docs/example)
- [API Reference](https://www.guidepup.dev/docs/api/class-guidepup)
- [Contributing](.github/CONTRIBUTING.md)
- [Changelog](https://github.com/guidepup/guidepup-playwright/releases)
- [MIT License](https://github.com/guidepup/guidepup-playwright/blob/main/LICENSE)
