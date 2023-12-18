import { defaultProtectedAppPageRules, defaultProtectedAppSessionDuration } from './constants.js';

export const buildProtectedAppMetadata = ({ host, origin }: { host: string; origin: string }) => ({
  protectedAppMetadata: {
    host,
    origin,
    sessionDuration: defaultProtectedAppSessionDuration,
    pageRules: defaultProtectedAppPageRules,
  },
});
