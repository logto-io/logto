import { type SsoConnectorFactoryDetail } from '@logto/schemas';
import classNames from 'classnames';

import ImageWithErrorFallback from '@/ds-components/ImageWithErrorFallback';

import * as styles from './index.module.scss';

type Props = {
  data: SsoConnectorFactoryDetail;
};

function SsoConnectorRadio({ data: { providerName, logo, description } }: Props) {
  return (
    <div className={styles.ssoConnector}>
      <ImageWithErrorFallback
        containerClassName={styles.container}
        className={styles.logo}
        alt="logo"
        src={logo}
      />
      <div className={styles.content}>
        <div className={classNames(styles.name)}>
          <span>{providerName}</span>
        </div>
        <div className={styles.description}>
          <span>{description}</span>
        </div>
      </div>
    </div>
  );
}

export default SsoConnectorRadio;
