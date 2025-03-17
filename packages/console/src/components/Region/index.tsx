import classNames from 'classnames';
import { type FunctionComponent } from 'react';
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

const regionDisplayNameMap: Readonly<Record<string, string>> = Object.freeze({
  [RegionName.EU]: 'Europe',
  [RegionName.US]: 'West US',
  [RegionName.AU]: 'Australia',
});

/**
 * Get the display name of the region. If the region is not in the map, return the original region
 * name.
 */
export const getRegionDisplayName = (regionName: string) =>
  regionDisplayNameMap[regionName] ?? regionName;

const regionFlagMap: Readonly<Record<string, FunctionComponent<React.SVGProps<SVGSVGElement>>>> =
  Object.freeze({
    [RegionName.EU]: euFlag,
    [RegionName.US]: usFlag,
    [RegionName.AU]: auFlag,
  });

type RegionFlagProps = {
  readonly regionName: string;
  readonly width?: number;
};

export function RegionFlag({ regionName, width = 16 }: RegionFlagProps) {
  const Flag = regionFlagMap[regionName];
  return Flag ? <Flag width={width} /> : null;
}

type Props = {
  readonly regionName: RegionName;
  readonly isComingSoon?: boolean;
  readonly className?: string;
};

function Region({ isComingSoon = false, regionName, className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <span className={classNames(styles.wrapper, className)}>
      <RegionFlag regionName={regionName} />
      <span>{getRegionDisplayName(regionName)}</span>
      {isComingSoon && <span className={styles.comingSoon}>{`(${t('general.coming_soon')})`}</span>}
    </span>
  );
}

export default Region;
