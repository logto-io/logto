import { I18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import DangerousRaw from '../DangerousRaw';
import * as styles from './index.module.scss';

type Props = {
  title: I18nKey | ReactElement<typeof DangerousRaw>;
  children: ReactNode;
  isRequired?: boolean;
  className?: string;
};

const FormField = ({ title, children, isRequired, className }: Props) => {
  const { t } = useTranslation();

  return (
    <div className={classNames(styles.field, className)}>
      <div className={styles.headline}>
        <div className={styles.title}>{typeof title === 'string' ? t(title) : title}</div>
        {isRequired && <div className={styles.required}>{t('admin_console.form.required')}</div>}
      </div>
      {children}
    </div>
  );
};

export default FormField;
