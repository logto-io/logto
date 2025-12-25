import { UAParser as parseUa } from 'ua-parser-js';

/**
 * Format passkey display name from user-agent string.
 * If the agent is a user-agent string, parse it to get "Browser on OS" format.
 * Otherwise, return the original name.
 */
export const formatPasskeyName = (name?: string, agent?: string): string | undefined => {
  // If user has set a custom name, use it
  if (name) {
    return name;
  }

  // If no agent string, return undefined
  if (!agent) {
    return undefined;
  }

  // Try to parse as user-agent string
  const { browser, os } = parseUa(agent);

  // If we can extract browser and OS info, format it
  if (browser.name && os.name) {
    return `${browser.name} on ${os.name}`;
  }

  // If parsing fails, return the original agent string (it might already be formatted)
  return agent;
};
