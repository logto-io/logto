import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';

import DynamicT from '@/ds-components/DynamicT';
import { Tooltip } from '@/ds-components/Tip';
import { onKeyDownHandler } from '@/utils/a11y';

import type { MultiCardSelectorOption } from '../types';

import styles from './CardItem.module.scss';

type Props = {
  readonly option: MultiCardSelectorOption;
  readonly isSelected: boolean;
  readonly onClick: (value: string) => void;
  readonly className?: string;
};

function CardItem({
  option: { icon, title, value, tag, trailingTag, isDisabled, disabledTip },
  isSelected,
  onClick,
  className,
}: Props) {
  return (
    <Tooltip content={conditional(isDisabled && disabledTip && <DynamicT forKey={disabledTip} />)}>
      <div
        key={value}
        role="button"
        tabIndex={0}
        className={classNames(
          styles.item,
          isDisabled && styles.disabled,
          isSelected && styles.selected,
          className
        )}
        onClick={() => {
          if (isDisabled) {
            return;
          }
          onClick(value);
        }}
        onKeyDown={onKeyDownHandler(() => {
          if (isDisabled) {
            return;
          }
          onClick(value);
        })}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        <div className={styles.content}>
          <div>
            {typeof title === 'string' ? <DynamicT forKey={title} /> : title}
            {trailingTag && (
              <span className={classNames(styles.tag, styles.trailingTag)}>
                <DynamicT forKey={trailingTag} />
              </span>
            )}
          </div>
          {tag && (
            <span className={styles.tag}>
              <DynamicT forKey={tag} />
            </span>
          )}
        </div>
      </div>
    </Tooltip>
  );
}

export default CardItem;
