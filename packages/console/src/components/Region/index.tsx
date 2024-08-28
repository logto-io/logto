import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

// TODO: This is a copy from `@logto/cloud-models`, make a SSoT for this later
export enum RegionName {
  EU = 'EU',
  US = 'US',
}

const regionFlagMap = Object.freeze({
  [RegionName.EU]: '🇪🇺',
  [RegionName.US]: '🇺🇸',
} satisfies Record<RegionName, string>);

type Props = {
  readonly regionName: RegionName;
  readonly isComingSoon?: boolean;
  readonly className?: string;
};

function Region({ isComingSoon = false, regionName, className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <span className={classNames(styles.regionText, className)}>
      {regionFlagMap[regionName]} {regionName}
      {isComingSoon && <span className={styles.comingSoon}>{`(${t('general.coming_soon')})`}</span>}
    </span>
  );
}

export default Region;
