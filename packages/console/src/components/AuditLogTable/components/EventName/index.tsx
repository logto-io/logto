import classNames from 'classnames';
import { Link } from 'react-router-dom';

import Failed from '@/assets/images/failed.svg';
import Success from '@/assets/images/success.svg';
import { logEventTitle } from '@/consts/logs';

import * as styles from './index.module.scss';

type Props = {
  eventKey: string;
  isSuccess: boolean;
  to?: string;
};

const EventName = ({ eventKey, isSuccess, to }: Props) => {
  const title = logEventTitle[eventKey] ?? eventKey;

  return (
    <div className={styles.eventName}>
      <div className={classNames(styles.icon, isSuccess ? styles.success : styles.fail)}>
        {isSuccess ? <Success /> : <Failed />}
      </div>
      {to && (
        <Link
          className={styles.title}
          to={to}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {title}
        </Link>
      )}
      {!to && <div className={styles.title}>{title}</div>}
    </div>
  );
};

export default EventName;
