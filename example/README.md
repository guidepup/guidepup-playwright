# Example

An example demonstrating using Guidepup for testing VoiceOver automation with [Playwright](https://playwright.dev/).

Run this example's test with the following from the root directory:

```console
npm run test
```

> Note: please ensure you have setup the [VoiceOver prerequisites](https://github.com/guidepup/guidepup/tree/main/guides/voiceover-prerequisites/README.md) before running this example.

## Test flow

1. The test launches Safari using Playwright
2. Navigates to the GitHub website
3. Moves through the website using VoiceOver controlled by Guidepup
4. Traverses headings until the Guidepup heading in the README.md is found

## See also

For a dedicated example of using Guidepup with Playwright and CircleCI see <https://github.com/guidepup/circleci-voiceover-example>.
