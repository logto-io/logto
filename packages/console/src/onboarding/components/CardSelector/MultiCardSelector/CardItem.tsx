import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '@/components/Tip';
import { onKeyDownHandler } from '@/utils/a11y';

import type { MultiCardSelectorOption } from '../types';

import * as styles from './CardItem.module.scss';

type Props = {
  option: MultiCardSelectorOption;
  isSelected: boolean;
  onClick: (value: string) => void;
  className?: string;
};

function CardItem({
  option: { icon, title, value, tag, trailingTag, isDisabled, disabledTip },
  isSelected,
  onClick,
  className,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Tooltip content={conditional(isDisabled && disabledTip && <>{t(disabledTip)}</>)}>
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
            {typeof title === 'string' ? t(title) : title}
            {trailingTag && (
              <span className={classNames(styles.tag, styles.trailingTag)}>{t(trailingTag)}</span>
            )}
          </div>
          {tag && <span className={styles.tag}>{t(tag)}</span>}
        </div>
      </div>
    </Tooltip>
  );
}

export default CardItem;
