import {
  type DesensitizedEnterpriseSsoTokenSetSecret,
  type DesensitizedSocialTokenSetSecret,
} from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Tag, { type Props as TagProps } from '@/ds-components/Tag';
import { TokenStatus } from '@/types/connector';
import { getTokenStatus } from '@/utils/connector';

import styles from './index.module.scss';

const getTagStatus = (tokenStatus: TokenStatus): TagProps['status'] => {
  switch (tokenStatus) {
    case 'active': {
      return 'success';
    }
    case 'expired': {
      return 'alert';
    }
    case 'inactive': {
      return 'info';
    }
    default: {
      return 'info';
    }
  }
};

type Props = {
  readonly isTokenStorageSupported?: boolean;
  readonly tokenSecret?: DesensitizedSocialTokenSetSecret | DesensitizedEnterpriseSsoTokenSetSecret;
};

function ConnectorTokenStatus({ isTokenStorageSupported, tokenSecret }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const status = getTokenStatus(isTokenStorageSupported, tokenSecret);

  if (status === TokenStatus.NotApplicable) {
    return (
      <span className={styles.notApplicable}>
        {t('user_details.connections.token_status.not_applicable')}
      </span>
    );
  }

  return (
    <Tag type="state" status={getTagStatus(status)} variant="plain">
      {t(`user_details.connections.token_status.${status}`)}
    </Tag>
  );
}

export default ConnectorTokenStatus;
