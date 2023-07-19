import DynamicT from '@/ds-components/DynamicT';

import * as styles from './index.module.scss';

function ProTag() {
  return (
    <div className={styles.tag}>
      <DynamicT forKey="upsell.pro_tag" />
    </div>
  );
}

export default ProTag;
