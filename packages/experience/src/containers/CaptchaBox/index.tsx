import { CaptchaType } from '@logto/schemas';
import { useCallback } from 'react';

import ReCaptchaEnterprise from '@/components/ReCaptchaEnterprise';
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

  if (captchaConfig?.type === CaptchaType.RecaptchaEnterprise) {
    return <ReCaptchaEnterprise siteKey={captchaConfig.siteKey} onVerify={onVerify} />;
  }

  return null;
};

export default CaptchaBox;
