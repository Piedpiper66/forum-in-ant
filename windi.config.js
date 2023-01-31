// @ts-check - enable TS check for js file
import { defineConfig } from "windicss/helpers";

function range(size, startAt = 1) {
  return Array.from(Array(size).keys()).map((i) => i + startAt);
}

export default defineConfig({
  safelist: [
    range(5).map((i) => `flex-${i}`), // flex-1 to flex-5
  ],
});
