import { createContext } from 'react';

import { type SignInExperienceResponse } from '@/types';

export type CaptchaContextType = {
  isCaptchaRequired: boolean;
  captchaConfig: SignInExperienceResponse['captchaConfig'];
  executeCaptcha: () => Promise<string | undefined>;
  // Some captcha providers need to render a widget (checkbox, etc.) to the page
  // and this is the ref to the widget
  widgetRef: React.RefObject<HTMLDivElement> | undefined;
};

export default createContext<CaptchaContextType>({
  isCaptchaRequired: false,
  captchaConfig: undefined,
  widgetRef: undefined,
  executeCaptcha: async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    return undefined;
  },
});
