# Orca Example

An example demonstrating using Guidepup for testing Orca automation with [Playwright](https://playwright.dev/).

Run this example's test with the following from the root directory:

```console
xvfb-run dbus-run-session -- npm run test
```

> Note: please ensure you have set up the [Orca prerequisites](https://www.guidepup.dev/docs/guides/environment) before running this example.

## Test flow

1. The test launches the browser using Playwright
2. Navigates to the Guidepup website
3. Moves through the website using Orca controlled by Guidepup
