import { type AdminConsoleKey } from '@logto/phrases';
import { useTranslation } from 'react-i18next';

import DynamicT from '@/ds-components/DynamicT';
import Tag, { type Props as TagProps } from '@/ds-components/Tag';
import { TokenStatus } from '@/types/connector';

import styles from './TokenCard.module.scss';

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
  readonly title: AdminConsoleKey;
  readonly status: TokenStatus;
  readonly connectorName?: string;
};

function TokenCard({ title, status, connectorName }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  if (status === TokenStatus.NotApplicable) {
    return null;
  }

  return (
    <div className={styles.tokenCard}>
      <div className={styles.tokenCardHeader}>
        {typeof title === 'string' ? <DynamicT forKey={title} /> : title}
        <Tag type="state" status={getTagStatus(status)} variant="plain">
          {t(`user_details.connections.token_status.${status}`)}
        </Tag>
      </div>
      <div className={styles.tokenCardDescription}>
        {t(`user_identity_details.access_token.description_${status}`, {
          connectorName,
        })}
      </div>
    </div>
  );
}
export default TokenCard;
