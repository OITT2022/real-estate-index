import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * STUB — Phase B'.2. Returns the default locale and an empty message
 * catalog. NO cookies(), NO next/headers import. Phase B'.3 will add
 * the real cookie reader if this stub deploys successfully.
 */
export default getRequestConfig(async () => {
  return {
    locale: routing.defaultLocale,
    messages: {},
  };
});
