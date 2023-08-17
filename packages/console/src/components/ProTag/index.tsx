import classNames from 'classnames';

import DynamicT from '@/ds-components/DynamicT';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
};

function ProTag({ className }: Props) {
  return (
    <div className={classNames(styles.tag, className)}>
      <DynamicT forKey="upsell.pro_tag" />
    </div>
  );
}

export default ProTag;
