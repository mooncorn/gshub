/* theme.ts */
import { extendTheme } from "@chakra-ui/react";
export const theme = extendTheme({
  useSystemColorMode: true,
  fonts: {
    heading: "var(--font-rubik)",
    body: "var(--font-rubik)",
  },
});
