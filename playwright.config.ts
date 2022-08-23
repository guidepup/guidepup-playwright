import { PlaywrightTestConfig } from "@playwright/test";
import { voConfig } from "./src/index";

const config: PlaywrightTestConfig = {
  ...voConfig,
};

export default config;
