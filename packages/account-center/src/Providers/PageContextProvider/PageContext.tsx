import { Theme } from '@logto/schemas';
import { createContext } from 'react';

import type { SignInExperienceResponse } from '@/types/sign-in-experience';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export type PageContextType = {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  experienceSettings?: SignInExperienceResponse;
  setExperienceSettings: React.Dispatch<React.SetStateAction<SignInExperienceResponse | undefined>>;
  isLoadingExperience: boolean;
  experienceError?: Error;
};

const PageContext = createContext<PageContextType>({
  theme: Theme.Light,
  setTheme: noop,
  experienceSettings: undefined,
  setExperienceSettings: noop,
  isLoadingExperience: false,
  experienceError: undefined,
});

export default PageContext;
