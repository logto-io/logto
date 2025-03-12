import classNames from 'classnames';

import DynamicT from '@/ds-components/DynamicT';
import CaptchaLogo from '@/pages/Security/CaptchaLogo';

import { type CaptchaProviderMetadata } from '../../types';

import styles from './index.module.scss';

type Props = {
  readonly data: CaptchaProviderMetadata;
};

function ProviderRadio({ data: { name, logo, logoDark, description } }: Props) {
  return (
    <div className={styles.connector}>
      <CaptchaLogo Logo={logo} LogoDark={logoDark} />
      <div className={styles.content}>
        <div className={classNames(styles.name)}>
          <DynamicT forKey={name} />
        </div>
        <div className={styles.description}>
          <DynamicT forKey={description} />
        </div>
      </div>
    </div>
  );
}

export default ProviderRadio;
