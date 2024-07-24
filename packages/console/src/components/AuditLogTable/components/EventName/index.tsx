import classNames from 'classnames';
import { Link } from 'react-router-dom';

import Failed from '@/assets/icons/failed.svg?react';
import Success from '@/assets/icons/success.svg?react';
import { logEventTitle } from '@/consts/logs';
import Tag from '@/ds-components/Tag';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import styles from './index.module.scss';

type Props = {
  readonly eventKey: string;
  readonly isSuccess: boolean;
  readonly to?: string;
};

function EventName({ eventKey, isSuccess, to }: Props) {
  const title = logEventTitle[eventKey] ?? eventKey;
  const { getTo } = useTenantPathname();

  return (
    <div className={styles.eventName}>
      <div className={classNames(styles.icon, isSuccess ? styles.success : styles.fail)}>
        {isSuccess ? <Success /> : <Failed />}
      </div>
      {to && (
        <Link
          className={styles.title}
          to={getTo(to)}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {title}
        </Link>
      )}
      {!to && <div className={styles.title}>{title}</div>}
      {eventKey === 'ExchangeTokenBy.TokenExchange' && <Tag status="alert">Impersonation</Tag>}
    </div>
  );
}

export default EventName;
