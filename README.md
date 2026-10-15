<div align="center">
  <img align="center" alt="" height="120px" width="120px" src="https://github.com/guidepup/guidepup/raw/main/img/logo.png">
  <h1 align="center">Guidepup for Playwright</h1>
</div>

<div align="center">
  <a href="https://www.npmjs.com/package/@guidepup/playwright"><img alt="@guidepup/playwright available on NPM" src="https://img.shields.io/npm/v/@guidepup/playwright" /></a>
  <a href="https://github.com/guidepup/guidepup-playwright/actions/workflows/test.yml"><img alt="@guidepup/playwright test workflows" src="https://github.com/guidepup/guidepup-playwright/workflows/Test/badge.svg" /></a>
  <a href="https://github.com/guidepup/guidepup-playwright/blob/main/LICENSE"><img alt="@guidepup/playwright uses the MIT license" src="https://img.shields.io/github/license/guidepup/guidepup-playwright" /></a>
</div>

## [Documentation](https://guidepup.dev) | [API Reference](https://www.guidepup.dev/docs/api/class-guidepup)

[![macOS Sonoma Support](https://img.shields.io/badge/macos-Sonoma-blue.svg?logo=apple)](https://support.apple.com/en-gb/102662)
[![macOS Sequoia Support](https://img.shields.io/badge/macos-Sequoia-blue.svg?logo=apple)](https://support.apple.com/en-gb/102662)
[![macOS Tahoe Support](https://img.shields.io/badge/macos-Tahoe-blue.svg?logo=apple)](https://support.apple.com/en-gb/102662)
[![macOS Golden Gate Support](https://img.shields.io/badge/macos-Golden%20Gate-blue.svg?logo=apple)](https://support.apple.com/en-gb/127455)
[![Windows Server 2022 Support](https://img.shields.io/badge/windows_server-2022-blue.svg?logo=windows)](https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-2022)
[![Windows Server 2025 Support](https://img.shields.io/badge/windows_server-2025-blue.svg?logo=windows)](https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-2025)
[![Ubuntu Resolute Support](https://img.shields.io/badge/ubuntu-26.04%2B-blue.svg?logo=ubuntu)](https://releases.ubuntu.com/resolute/)
[![Debian Trixie Support](https://img.shields.io/badge/debian-13%2B-blue.svg?logo=debian)](https://www.debian.org/releases/trixie/)

Guidepup is a screen reader automation library for testing.

This package provides [Guidepup](https://github.com/guidepup/guidepup) integration with [Playwright](https://playwright.dev/) to enable testing with <a href="https://www.guidepup.dev/docs/api/class-nvda"><b>NVDA on Windows</b></a>, <a href="https://www.guidepup.dev/docs/api/class-orca"><b>Orca on Linux</b></a>, and <a href="https://www.guidepup.dev/docs/api/class-voiceover"><b>VoiceOver on macOS</b></a>.

## Capabilities

- **Full Control** - If a screen reader has a keyboard command, then Guidepup supports it.
- **Mirrors Real User Experience** - Assert on what users really do and hear when using screen readers.

## Getting started

Set up your machine for screen reader automation:

```sh
npx @guidepup/setup setup
```

Install `@guidepup/playwright` to your project:

```sh
npm install --save-dev @guidepup/playwright @guidepup/guidepup @playwright/test
```

> [!NOTE]
> `@guidepup/guidepup` and `@playwright/test` are required as peer dependencies of this project.

Install the Guidepup screen reader assets:

```sh
npx @guidepup/setup install
```

And get cracking with your first screen reader tests in Playwright!

## Examples

Head over to the [Guidepup Website](https://www.guidepup.dev/) for guides, real world examples, environment setup, and complete API documentation with examples.

You can also check out these [examples](https://github.com/guidepup/guidepup-playwright/tree/main/examples) to learn how you could use Guidepup with Playwright in your projects.

### Playwright config

In your `playwright.config.ts` add the following for the best results with Guidepup for Screen Reader automation:

```ts
import { withGuidepup } from "@guidepup/playwright";

export default withGuidepup({
  // ... your custom config
});
```

`withGuidepup` configures Playwright to run tests serially and forces headed
browsers, including when browser options are specified in individual projects.
The existing `screenReaderConfig` export remains available if you prefer to
spread the configuration manually.

### Web content navigation

In addition to the Guidepup APIs the `screenReader`, `nvda`, `orca`, and `voiceOver` instances provided by the Guidepup Playwright setup have an additional utility method `.navigateToWebContent()`.

This method will navigate the screen reader to the first element of the document body in the browser.

Use this method after you navigate to a page and have made any necessary checks that the page has loaded as expected. For example, this is how you might use the method:

```ts
// Navigate to the desired page
await page.goto("https://github.com/guidepup/guidepup", {
  waitUntil: "load",
});

// Wait for page to be ready
await page.locator('header[role="banner"]').waitFor();

// Navigate to the web content
await screenReader.navigateToWebContent();

// ... some commands
```

### Providing screen reader start options

The options provided to `screenReader.start([options])`, `nvda.start([options])`, `orca.start([options])`, or `voiceOver.start([options])` can be configured using `test.use(config)` as follows:

```ts
// Screen Reader Example
import { screenReaderTest as test } from "@guidepup/playwright";

// Capture all spoken phrases, including usage hints
test.use({ screenReaderStartOptions: { capture: true } });
```

```ts
// NVDA Example
import { nvdaTest as test } from "@guidepup/playwright";

// Capture all spoken phrases, including usage hints
test.use({ nvdaStartOptions: { capture: true } });
```

```ts
// Orca Example
import { orcaTest as test } from "@guidepup/playwright";

// Capture all spoken phrases, including usage hints
test.use({ orcaStartOptions: { capture: true } });
```

```ts
// VoiceOver Example
import { voiceOverTest as test } from "@guidepup/playwright";

// Capture all spoken phrases, including usage hints
test.use({ voiceOverStartOptions: { capture: true } });
```

The default for NVDA, Orca, and VoiceOver is set to `"initial"`. `true` captures all spoken phrases, including usage hints. `false` disables spoken phrase capture.

### NVDA example

`playwright.config.ts`:

```ts
import { devices } from "@playwright/test";
import { withGuidepup } from "@guidepup/playwright";

const config = withGuidepup({
  reportSlowTests: null,
  timeout: 5 * 60 * 1000,
  retries: 2,
  projects: [
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

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
    while ((await nvda.lastSpokenPhrase()) !== "Guidepup, heading, level 1") {
      await nvda.nextHeading();
    }

    // Assert that the spoken phrases are as expected
    expect(JSON.stringify(await nvda.spokenPhraseLog())).toMatchSnapshot();
  });
});
```

### Orca example

`playwright.config.ts`:

```ts
import { devices } from "@playwright/test";
import { withGuidepup } from "@guidepup/playwright";

const config = withGuidepup({
  reportSlowTests: null,
  timeout: 5 * 60 * 1000,
  retries: 2,
  projects: [
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});

export default config;
```

`orca.spec.ts`:

```ts
import { orcaTest as test } from "@guidepup/playwright";
import { expect } from "@playwright/test";

test.describe("Playwright Orca", () => {
  test("I can navigate the Guidepup Github page with Orca", async ({
    page,
    orca,
  }) => {
    // Navigate to Guidepup GitHub page
    await page.goto("https://github.com/guidepup/guidepup", {
      waitUntil: "load",
    });

    // Wait for page to be ready and setup
    const header = page.locator('header[role="banner"]');
    await header.waitFor();

    // Interact with the page
    await orca.navigateToWebContent();

    // Move across the page menu to the Guidepup heading using Orca
    while ((await orca.lastSpokenPhrase()) !== "Guidepup. heading 1") {
      await orca.nextHeading();
    }

    // Assert that the spoken phrases are as expected
    expect(JSON.stringify(await orca.spokenPhraseLog())).toMatchSnapshot();
  });
});
```

### VoiceOver example

`playwright.config.ts`:

```ts
import { devices } from "@playwright/test";
import { withGuidepup } from "@guidepup/playwright";

const config = withGuidepup({
  reportSlowTests: null,
  timeout: 5 * 60 * 1000,
  retries: 2,
  projects: [
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});

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
    while (
      (await voiceOver.lastSpokenPhrase()) !== "heading level 1 Guidepup"
    ) {
      await voiceOver.nextHeading();
    }

    // Assert that the spoken phrases are as expected
    expect(JSON.stringify(await voiceOver.spokenPhraseLog())).toMatchSnapshot();
  });
});
```

### Capture Playwright Interactions

Use the `capture()` API to wrap Playwright interactions and capture the resulting screen reader output without needing to perform the interaction through Guidepup.

```ts
const capture = await screenReader.capture(() =>
  page.getByRole("button", { name: "Add to cart" }).click(),
);

expect(capture.spokenPhrase).toContain("Added to cart");
```

## Powerful tooling

Check out some of the other Guidepup tooling:

- [`@guidepup/setup`](https://github.com/guidepup/setup/) - Set up your local or CI environment for screen reader test automation.
- [`@guidepup/guidepup`](https://github.com/guidepup/guidepup/) - Reliable automation for your screen reader a11y workflows through JavaScript supporting VoiceOver, NVDA, and Orca.
- [`ghcr.io/guidepup/guidepup`](https://github.com/guidepup/guidepup-docker/pkgs/container/guidepup) - Seemless integration of Guidepup in Docker.
- [`@guidepup/virtual-screen-reader`](https://github.com/guidepup/virtual-screen-reader/) - Reliable unit testing for your screen reader a11y workflows.
- [`@guidepup/jest`](https://github.com/guidepup/jest/) - Jest matchers for reliable unit testing of your screen reader a11y workflows.

## Resources

- [Documentation](https://www.guidepup.dev/docs/getting-started/real-world-example)
- [API Reference](https://www.guidepup.dev/docs/api/class-guidepup)
- [Contributing](.github/CONTRIBUTING.md)
- [Changelog](https://github.com/guidepup/guidepup-playwright/releases)
- [MIT License](https://github.com/guidepup/guidepup-playwright/blob/main/LICENSE)
