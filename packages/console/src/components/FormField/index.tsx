import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Tip from '@/assets/images/tip.svg';

import type DangerousRaw from '../DangerousRaw';
import IconButton from '../IconButton';
import Spacer from '../Spacer';
import { ToggleTip } from '../Tip';
import * as styles from './index.module.scss';

export type Props = {
  title: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  children: ReactNode;
  isRequired?: boolean;
  className?: string;
  headlineClassName?: string;
  tip?: AdminConsoleKey;
};

const FormField = ({ title, children, isRequired, className, tip, headlineClassName }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={classNames(styles.field, className)}>
      <div className={classNames(styles.headline, headlineClassName)}>
        <div className={styles.title}>{typeof title === 'string' ? t(title) : title}</div>
        {tip && (
          <ToggleTip anchorClassName={styles.toggleTipButton} content={<div>{t(tip)}</div>}>
            <IconButton size="small">
              <Tip />
            </IconButton>
          </ToggleTip>
        )}
        <Spacer />
        {isRequired && <div className={styles.required}>{t('general.required')}</div>}
      </div>
      {children}
    </div>
  );
};

export default FormField;
