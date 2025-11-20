import type { SignInExperienceResponse } from '@experience/shared/types';
import { Theme, type AccountCenter } from '@logto/schemas';
import { createContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export type PageContextType = {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  experienceSettings?: SignInExperienceResponse;
  setExperienceSettings: React.Dispatch<React.SetStateAction<SignInExperienceResponse | undefined>>;
  accountCenterSettings?: AccountCenter;
  setAccountCenterSettings: React.Dispatch<React.SetStateAction<AccountCenter | undefined>>;
  isLoadingExperience: boolean;
  experienceError?: Error;
};

const PageContext = createContext<PageContextType>({
  theme: Theme.Light,
  setTheme: noop,
  experienceSettings: undefined,
  setExperienceSettings: noop,
  accountCenterSettings: undefined,
  setAccountCenterSettings: noop,
  isLoadingExperience: false,
  experienceError: undefined,
});

export default PageContext;
