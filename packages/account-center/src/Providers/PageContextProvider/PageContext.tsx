import type { SignInExperienceResponse } from '@experience/shared/types';
import { Theme, type AccountCenter, type UserProfileResponse } from '@logto/schemas';
import { createContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export type PageContextType = {
  theme: Theme;
  toast: string;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  setToast: React.Dispatch<React.SetStateAction<string>>;
  experienceSettings?: SignInExperienceResponse;
  setExperienceSettings: React.Dispatch<React.SetStateAction<SignInExperienceResponse | undefined>>;
  accountCenterSettings?: AccountCenter;
  setAccountCenterSettings: React.Dispatch<React.SetStateAction<AccountCenter | undefined>>;
  userInfo?: Partial<UserProfileResponse>;
  setUserInfo: React.Dispatch<React.SetStateAction<Partial<UserProfileResponse> | undefined>>;
  userInfoError?: Error;
  verificationId?: string;
  setVerificationId: (verificationId?: string, expiresAt?: string) => void;
  isLoadingExperience: boolean;
  experienceError?: Error;
};

const PageContext = createContext<PageContextType>({
  theme: Theme.Light,
  toast: '',
  setTheme: noop,
  setToast: noop,
  experienceSettings: undefined,
  setExperienceSettings: noop,
  accountCenterSettings: undefined,
  setAccountCenterSettings: noop,
  userInfo: undefined,
  setUserInfo: noop,
  userInfoError: undefined,
  verificationId: undefined,
  setVerificationId: noop,
  isLoadingExperience: false,
  experienceError: undefined,
});

export default PageContext;
