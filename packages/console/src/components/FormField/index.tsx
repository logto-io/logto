import { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { ReactElement, ReactNode, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Tip from '@/icons/Tip';

import DangerousRaw from '../DangerousRaw';
import Spacer from '../Spacer';
import Tooltip from '../Tooltip';
import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  children: ReactNode;
  isRequired?: boolean;
  className?: string;
  tooltip?: AdminConsoleKey;
};

const FormField = ({ title, children, isRequired, className, tooltip }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tipRef = useRef<HTMLDivElement>(null);

  return (
    <div className={classNames(styles.field, className)}>
      <div className={styles.headline}>
        <div className={styles.title}>{typeof title === 'string' ? t(title) : title}</div>
        {tooltip && (
          <div ref={tipRef} className={styles.icon}>
            <Tip />
            <Tooltip anchorRef={tipRef} content={t(tooltip)} />
          </div>
        )}
        <Spacer />
        {isRequired && <div className={styles.required}>{t('general.required')}</div>}
      </div>
      {children}
    </div>
  );
};

export default FormField;
