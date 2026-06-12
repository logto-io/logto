import { createContext } from 'react';

type ReauthPromptContextValue = {
  requestReauthPrompt: () => void;
};

const ReauthPromptContext = createContext<ReauthPromptContextValue>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  requestReauthPrompt: () => {},
});

export default ReauthPromptContext;
