import type { User } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Checkbox from '@/components/Checkbox';
import UserAvatar from '@/components/UserAvatar';
import { onKeyDownHandler } from '@/utilities/a11y';

import * as styles from './index.module.scss';

type Props = {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
};

const SourceUserItem = ({ user: { avatar, name }, isSelected, onSelect }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.item}
      onKeyDown={onKeyDownHandler(() => {
        onSelect();
      })}
      onClick={() => {
        onSelect();
      }}
    >
      <Checkbox
        checked={isSelected}
        onChange={() => {
          onSelect();
        }}
      />
      <UserAvatar className={styles.avatar} url={avatar} />
      <div className={styles.name}>{name ?? t('users.unnamed')}</div>
    </div>
  );
};

export default SourceUserItem;
