import type { PlaywrightTestConfig } from "@playwright/test";
import { screenReaderConfig } from "./screenReaderConfig";

export const withGuidepup = (
  config: PlaywrightTestConfig,
): PlaywrightTestConfig => ({
  ...config,
  workers: screenReaderConfig.workers,
  fullyParallel: screenReaderConfig.fullyParallel,
  use: {
    ...config.use,
    ...screenReaderConfig.use,
  },
  projects: config.projects?.map((project) => ({
    ...project,
    use: {
      ...project.use,
      ...screenReaderConfig.use,
    },
  })),
});
