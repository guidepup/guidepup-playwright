# VoiceOver Example

An example demonstrating using Guidepup for testing VoiceOver automation with [Playwright](https://playwright.dev/).

Run this example's test with the following from the root directory:

```console
npm run test
```

> Note: please ensure you have [setup you environment](https://www.guidepup.dev/docs/guides/automated-environment-setup) for VoiceOver automation before running this example.

## Test flow

1. The test launches the browser using Playwright
2. Navigates to the GitHub website
3. Moves through the website using VoiceOver controlled by Guidepup
4. Traverses headings until the Guidepup heading in the README.md is found
