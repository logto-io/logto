import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Tip from '@/assets/images/tip.svg';

import type DangerousRaw from '../DangerousRaw';
import Spacer from '../Spacer';
import Tooltip from '../Tooltip';
import * as styles from './index.module.scss';

export type Props = {
  title: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  children: ReactNode;
  isRequired?: boolean;
  className?: string;
  headlineClassName?: string;
  tooltip?: AdminConsoleKey;
};

const FormField = ({
  title,
  children,
  isRequired,
  className,
  tooltip,
  headlineClassName,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tipRef = useRef<HTMLDivElement>(null);

  return (
    <div className={classNames(styles.field, className)}>
      <div className={classNames(styles.headline, headlineClassName)}>
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
