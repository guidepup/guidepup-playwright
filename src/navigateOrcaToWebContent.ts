import { execFileSync } from "node:child_process";
import {
  type CommandOptions,
  type Orca,
  orcaKeyCodeCommands,
} from "@guidepup/guidepup";
import type { Page } from "@playwright/test";
import { cleanString } from "./cleanString";
import { delay } from "./delay";

const MAX_APPLICATION_SWITCH_RETRY_COUNT = 10;

const focusOrcaBrowser = async ({
  orca,
  pageTitle,
}: {
  orca: Orca;
  pageTitle: string;
}): Promise<void> => {
  const cleanedPageTitle = cleanString(pageTitle);

  if (!cleanedPageTitle) {
    throw new Error(
      "Cannot focus an application window with an empty page title.",
    );
  }

  const currentSpokenPhraseLog = [...(await orca.spokenPhraseLog())];

  try {
    for (
      let retryCount = 0;
      retryCount <= MAX_APPLICATION_SWITCH_RETRY_COUNT;
      retryCount++
    ) {
      await orca.clearSpokenPhraseLog();
      await orca.perform(orcaKeyCodeCommands.PresentTitle, {
        capture: "initial",
      });

      const windowTitle = cleanString(await orca.lastSpokenPhrase());

      if (windowTitle.includes(cleanedPageTitle)) {
        return;
      }

      if (retryCount < MAX_APPLICATION_SWITCH_RETRY_COUNT) {
        execFileSync("xdotool", ["key", "--clearmodifiers", "alt+Tab"]);
        await delay(100);
      }
    }

    throw new Error(
      `Unable to focus the application window with title "${pageTitle}" after ${MAX_APPLICATION_SWITCH_RETRY_COUNT} attempts.`,
    );
  } finally {
    await orca.clearSpokenPhraseLog();

    const spokenPhraseLog = await orca.spokenPhraseLog();

    spokenPhraseLog.push(...currentSpokenPhraseLog);
  }
};

export const navigateOrcaToWebContent = async ({
  orca,
  page,
  capture,
}: {
  orca: Orca;
  page: Page;
  capture?: CommandOptions["capture"];
}): Promise<void> => {
  const pageTitle = await page.title();

  await focusOrcaBrowser({ orca, pageTitle });

  await page.bringToFront();
  await page.locator("body").waitFor();
  await page.locator("body").focus();
  await page.locator("body").click();
  await page.locator("body").blur();

  await orca.perform(orcaKeyCodeCommands.StartOfFile, { capture });
};
