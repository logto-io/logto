import type { I18nKey } from '@logto/phrases-ui';
import type { Nullable } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';

import ArrowNext from '@/assets/icons/arrow-next.svg';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

type Item = {
  label: I18nKey;
  value?: Nullable<string>;
  onTap: () => void;
};

type Props = {
  data: Item[];
};

const NavItem = ({ data }: Props) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      {data.map(({ label, value, onTap }) => (
        <div
          key={label}
          className={styles.item}
          role="button"
          tabIndex={0}
          onClick={onTap}
          onKeyDown={onKeyDownHandler({
            Enter: onTap,
          })}
        >
          <div className={styles.wrapper}>
            <div className={styles.content}>
              <div className={styles.label}>{t(label)}</div>
              {value && <div className={styles.value}>{value}</div>}
            </div>
            <div className={styles.action}>
              <ArrowNext />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NavItem;
