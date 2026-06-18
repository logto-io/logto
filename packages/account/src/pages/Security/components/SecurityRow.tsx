import classNames from 'classnames';
import { type FunctionComponent, type SVGProps } from 'react';
import { useTranslation } from 'react-i18next';

import { layoutClassNames } from '@ac/constants/layout';

import styles from './index.module.scss';

export type SecurityRowData = {
  key: string;
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  label: string;
  value?: string;
  isPlainValue?: boolean;
  isConfigured: boolean;
  action?: { label: string; handler: () => void };
};

type Props = {
  readonly row: SecurityRowData;
};

const SecurityRow = ({ row }: Props) => {
  const { t } = useTranslation();
  const { icon: Icon, label, value, isPlainValue, isConfigured, action } = row;

  return (
    <div className={classNames(styles.row, layoutClassNames.row)}>
      <div className={styles.topLine}>
        <div className={styles.iconWrap}>
          <Icon className={styles.icon} />
        </div>
        {action && (
          <div className={styles.actions}>
            <button type="button" className={styles.actionButton} onClick={action.handler}>
              {action.label}
            </button>
          </div>
        )}
      </div>
      <div className={styles.title}>{label}</div>
      <div className={styles.value}>
        {isConfigured ? (
          isPlainValue ? (
            <span className={styles.plainValue}>{value}</span>
          ) : (
            <span className={styles.statusTag}>
              <span className={styles.statusDot} />
              {value}
            </span>
          )
        ) : (
          <span className={styles.notConfigured}>
            {t('account_center.security.not_configured')}
          </span>
        )}
      </div>
    </div>
  );
};

export default SecurityRow;
