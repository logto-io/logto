import classNames from 'classnames';
import { type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

import auFlag from './assets/au.svg?react';
import euFlag from './assets/eu.svg?react';
import usFlag from './assets/us.svg?react';
import styles from './index.module.scss';

// TODO: This is a copy from `@logto/cloud-models`, make a SSoT for this later
export enum RegionName {
  EU = 'EU',
  US = 'US',
  AU = 'AU',
}

export const regionDisplayNameMap = Object.freeze({
  [RegionName.EU]: 'Europe',
  [RegionName.US]: 'West US',
  [RegionName.AU]: 'Australia',
} satisfies Record<RegionName, string>);

export const regionFlagMap = Object.freeze({
  [RegionName.EU]: euFlag,
  [RegionName.US]: usFlag,
  [RegionName.AU]: auFlag,
} satisfies Record<RegionName, ComponentType>);

type Props = {
  readonly regionName: RegionName;
  readonly isComingSoon?: boolean;
  readonly className?: string;
};

function Region({ isComingSoon = false, regionName, className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const Flag = regionFlagMap[regionName];

  return (
    <span className={classNames(styles.wrapper, className)}>
      <Flag width={18} />
      <span>{regionDisplayNameMap[regionName]}</span>
      {isComingSoon && <span className={styles.comingSoon}>{`(${t('general.coming_soon')})`}</span>}
    </span>
  );
}

export default Region;
