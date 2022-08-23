import { PlaywrightTestConfig } from "@playwright/test";
import { voConfig } from "./src/index";

const config: PlaywrightTestConfig = {
  ...voConfig,
  use: {
    ...voConfig.use,
  },
};

export default config;
