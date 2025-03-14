import { type CaptchaProvider } from '@logto/schemas';
import { useNavigate } from 'react-router-dom';

import Gear from '@/assets/icons/gear.svg?react';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';

import CaptchaLogo from '../CaptchaLogo';
import { captchaProviders } from '../CreateCaptchaForm/constants';

import styles from './index.module.scss';

type Props = {
  readonly captchaProvider: CaptchaProvider;
};

function CaptchaCard({ captchaProvider }: Props) {
  const metadata = captchaProviders.find(
    (provider) => provider.type === captchaProvider.config.type
  );
  const navigate = useNavigate();

  if (!metadata) {
    return null;
  }

  return (
    <div className={styles.container}>
      <CaptchaLogo Logo={metadata.logo} LogoDark={metadata.logoDark} />
      <div className={styles.name}>
        <DynamicT forKey={metadata.name} />
      </div>
      <Button
        type="text"
        icon={<Gear />}
        title="security.bot_protection.settings"
        onClick={() => {
          navigate('captcha');
        }}
      />
    </div>
  );
}

export default CaptchaCard;
