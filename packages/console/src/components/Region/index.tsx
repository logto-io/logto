import { type PublicRegionName } from '@logto/cloud/routes';
import classNames from 'classnames';
import { useMemo, type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import auFlag from './assets/au.svg?react';
import euFlag from './assets/eu.svg?react';
import jpFlag from './assets/jp.svg?react';
import usFlag from './assets/us.svg?react';
import styles from './index.module.scss';

export const defaultRegionName = 'EU' satisfies PublicRegionName;

const regionDisplayNameMap: Readonly<Record<PublicRegionName, string> & Record<string, string>> =
  Object.freeze({
    EU: 'Europe',
    US: 'West US',
    AU: 'Australia',
    JP: 'Japan',
  });

/**
 * Get the display name of the region. If the region is not in the map, return the original region
 * name.
 */
export const getRegionDisplayName = (regionName: string) =>
  regionDisplayNameMap[regionName] ?? regionName;

const regionFlagMap: Readonly<Record<string, FunctionComponent<React.SVGProps<SVGSVGElement>>>> =
  Object.freeze({
    EU: euFlag,
    US: usFlag,
    AU: auFlag,
    JP: jpFlag,
  });

type RegionFlagProps = {
  readonly regionName: string;
  readonly width?: number;
};

export function RegionFlag({ regionName, width = 16 }: RegionFlagProps) {
  // Try to find a part of the region name that matches the keys in the map. E.g. "WEST_US" will
  // match "US" and return the US flag.
  const Flag = useMemo(
    () =>
      regionName
        .split('_')
        .map((part) => regionFlagMap[part])
        .find(Boolean),
    [regionName]
  );
  return Flag ? <Flag width={width} /> : null;
}

type Props = {
  readonly regionName: string;
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
