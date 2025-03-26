import { CaptchaType } from '@logto/schemas';
import { useCallback } from 'react';

import Turnstile from '@/components/Turnstile';
import { type SignInExperienceResponse } from '@/types';

type Props = {
  readonly captchaConfig?: SignInExperienceResponse['captchaConfig'];
  readonly setCaptchaToken: (token: string) => void;
};

const CaptchaBox = ({ setCaptchaToken, captchaConfig }: Props) => {
  const onVerify = useCallback(
    (token: string) => {
      setCaptchaToken(token);
    },
    [setCaptchaToken]
  );

  if (captchaConfig?.type === CaptchaType.Turnstile) {
    return <Turnstile siteKey={captchaConfig.siteKey} onVerify={onVerify} />;
  }

  return null;
};

export default CaptchaBox;
