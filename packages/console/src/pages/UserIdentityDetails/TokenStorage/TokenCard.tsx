import { type AdminConsoleKey } from '@logto/phrases';
import { useTranslation } from 'react-i18next';

import DynamicT from '@/ds-components/DynamicT';
import Tag, { type Props as TagProps } from '@/ds-components/Tag';
import { type TokenStatus } from '@/types/connector';

import styles from './TokenCard.module.scss';

export type AvailableStatus = 'available' | 'not_available';

const getTagStatus = (tokenStatus: TokenStatus | AvailableStatus): TagProps['status'] => {
  switch (tokenStatus) {
    case 'active':
    case 'available': {
      return 'success';
    }
    case 'not_available': {
      return 'alert';
    }
    case 'expired': {
      return 'error';
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
  readonly description: AdminConsoleKey;
  readonly status: TokenStatus | AvailableStatus;
};

function TokenCard({ title, description, status }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  return (
    <div className={styles.tokenCard}>
      <div className={styles.tokenCardHeader}>
        {typeof title === 'string' ? <DynamicT forKey={title} /> : title}
        <Tag type="state" status={getTagStatus(status)} variant="plain">
          {t(`user_details.connections.token_status.${status}`)}
        </Tag>
      </div>
      <div className={styles.tokenCardDescription}>
        {typeof description === 'string' ? <DynamicT forKey={description} /> : description}
      </div>
    </div>
  );
}
export default TokenCard;
