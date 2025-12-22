import { TenantTag } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo, type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { type RegionResponse as RegionType } from '@/cloud/types/router';

import auFlag from './assets/au.svg?react';
import euFlag from './assets/eu.svg?react';
import jpFlag from './assets/jp.svg?react';
import logtoFlag from './assets/logto.svg?react';
import ukFlag from './assets/uk.svg?react';
import usFlag from './assets/us.svg?react';
import styles from './index.module.scss';

export const defaultRegionName = 'EU';

const regionDisplayNameMap: Readonly<Record<string, string>> = Object.freeze({
  EU: 'Europe',
  US: 'West US',
  AU: 'Australia',
  JP: 'Japan',
  UK: 'United Kingdom',
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
    UK: ukFlag,
    LOGTO: logtoFlag,
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

type StaticRegionProps = {
  readonly regionName: string;
  readonly isComingSoon?: boolean;
  readonly className?: string;
};

/**
 * @deprecated A legacy component that renders a region by name. You should use the new
 * {@link Region} component to render region data from the API instead.
 */
export function StaticRegion({ isComingSoon = false, regionName, className }: StaticRegionProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <span className={classNames(styles.wrapper, className)}>
      <RegionFlag regionName={regionName} />
      <span>{getRegionDisplayName(regionName)}</span>
      {isComingSoon && <span className={styles.comingSoon}>{`(${t('general.coming_soon')})`}</span>}
    </span>
  );
}

export type InstanceDropdownItemProps = Pick<
  RegionType,
  'name' | 'country' | 'tags' | 'displayName'
>;

/**
 * The default public Logto instance dropdown item.
 *
 * @remarks
 * This item is a placeholder for the public Logto instance and is used in the instance selection dropdown.
 *
 * - When selected, it indicates that the user is choosing the public Logto instance, need to show the public region radio options below.
 * - When not selected, it indicates that the user is choosing a private instance, need to hide the public region radio options below.
 */
export const publicInstancesDropdownItem: InstanceDropdownItemProps = {
  name: 'logto',
  displayName: 'Logto Cloud (Public)',
  country: 'LOGTO',
  tags: Object.values(TenantTag),
};

type Props = {
  readonly region: RegionType;
  readonly className?: string;
};

function Region({ region, className }: Props) {
  return (
    <span className={classNames(styles.wrapper, className)}>
      <RegionFlag regionName={region.name} />
      <span>{region.displayName}</span>
    </span>
  );
}

export default Region;
