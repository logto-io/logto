import classNames from 'classnames';
import { useMemo } from 'react';

import Tip from '@/assets/icons/tip.svg?react';
import IconButton from '@/ds-components/IconButton';
import Select from '@/ds-components/Select';
import type { Props as ToggleTipProps } from '@/ds-components/Tip/ToggleTip';
import ToggleTip from '@/ds-components/Tip/ToggleTip';
import useAvailableDomains from '@/hooks/use-available-domains';

import styles from './index.module.scss';

type Props = {
  readonly value?: string;
  readonly onChange: (value?: string) => void;
  readonly tip?: ToggleTipProps['content'];
  readonly className?: string;
};

function DomainSelector({ value, onChange, tip, className }: Props) {
  const availableDomains = useAvailableDomains();

  const options = useMemo(() => {
    return availableDomains.map((domain) => {
      return {
        value: domain,
        title: domain,
      };
    });
  }, [availableDomains]);

  return (
    <div className={classNames(styles.domainSelector, className)}>
      <Select
        value={value}
        options={options}
        className={styles.selector}
        isReadOnly={options.length <= 1}
        onChange={onChange}
      />
      {tip && (
        <ToggleTip anchorClassName={styles.toggleTipButton} content={tip} horizontalAlign="start">
          <IconButton size="small">
            <Tip />
          </IconButton>
        </ToggleTip>
      )}
    </div>
  );
}

export default DomainSelector;
