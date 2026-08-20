import { useInvitation } from "./use-invitation";

/**
 * Custom hook to access wedding configuration
 * Returns config from API - no fallback to static config
 *
 * @returns {object} Wedding configuration data
 *
 * @example
 * const config = useConfig();
 * console.log(config.groomName, config.brideName);
 */
export function useConfig() {
  const { config } = useInvitation();

  // Return API config - no static fallback
  // Components should handle loading/error states
  return config;
}
