import classNames from 'classnames';
import { Link } from 'react-router-dom';

import Failed from '@/assets/images/failed.svg';
import Success from '@/assets/images/success.svg';
import { logEventTitle } from '@/consts/logs';

import * as styles from './index.module.scss';

type Props = {
  type: string;
  isSuccess: boolean;
  to?: string;
};

const EventName = ({ type, isSuccess, to }: Props) => {
  const title = logEventTitle[type] ?? type;

  return (
    <div className={styles.eventName}>
      <div className={classNames(styles.icon, isSuccess ? styles.success : styles.fail)}>
        {isSuccess ? <Success /> : <Failed />}
      </div>
      <div>
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
    </div>
  );
};

export default EventName;
