import classNames from 'classnames';
import { useContext } from 'react';

import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';

import * as styles from './index.module.scss';

type Props = {
  isVisibleInProdTenant: boolean;
  className?: string;
};

function ProTag({ isVisibleInProdTenant, className }: Props) {
  const { isDevTenant } = useContext(TenantsContext);

  return isCloud && ((isDevFeaturesEnabled && isDevTenant) || isVisibleInProdTenant) ? (
    <div className={classNames(styles.tag, className)}>
      <DynamicT forKey="upsell.pro_tag" />
    </div>
  ) : null;
}

export default ProTag;
