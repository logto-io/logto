import DynamicT from '@experience/shared/components/DynamicT';
import classNames from 'classnames';
import type { TFuncKey } from 'i18next';

import { useAccountLayout } from '@ac/Providers/AccountLayoutContext';
import { layoutClassNames } from '@ac/constants/layout';

import styles from '../../pages/Home/index.module.scss';

type Props = {
  readonly titleKey: TFuncKey;
  readonly descriptionKey: TFuncKey;
};

const AccountPageHeader = ({ titleKey, descriptionKey }: Props) => {
  const { showsMobileTabNav } = useAccountLayout();

  if (showsMobileTabNav) {
    return null;
  }

  return (
    <div className={styles.header}>
      <div className={classNames(styles.title, layoutClassNames.pageTitle)}>
        <DynamicT forKey={titleKey} />
      </div>
      <div className={classNames(styles.description, layoutClassNames.pageDescription)}>
        <DynamicT forKey={descriptionKey} />
      </div>
    </div>
  );
};

export default AccountPageHeader;
