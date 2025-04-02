import { CaptchaType } from '@logto/schemas';
import { useContext } from 'react';

import CaptchaContext from '@/Providers/CaptchaContextProvider/CaptchaContext';

import styles from './index.module.scss';

const CaptchaBox = () => {
  const { captchaConfig, widgetRef, isCaptchaRequired } = useContext(CaptchaContext);

  // Currently only Turnstile needs a widget to be rendered
  if (!isCaptchaRequired || captchaConfig?.type !== CaptchaType.Turnstile) {
    return null;
  }

  return <div ref={widgetRef} className={styles.captchaBox} />;
};

export default CaptchaBox;
