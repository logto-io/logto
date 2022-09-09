import { useLogto, IdTokenClaims } from '@logto/react';
import classNames from 'classnames';
import { useEffect, useRef, useState, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown, { DropdownItem } from '@/components/Dropdown';
import { Ring as Spinner } from '@/components/Spinner';
import { generateAvatarPlaceHolderById } from '@/consts/avatars';
import SignOut from '@/icons/SignOut';

import UserInfoSkeleton from '../UserInfoSkeleton';
import * as styles from './index.module.scss';

const UserInfo = () => {
  const { isAuthenticated, getIdTokenClaims, signOut } = useLogto();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<Pick<IdTokenClaims, 'sub' | 'username' | 'avatar'>>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        const userInfo = await getIdTokenClaims();
        setUser(userInfo ?? { sub: '', username: 'N/A' }); // Provide a fallback to avoid infinite loading state
      }
    })();
  }, [isAuthenticated, getIdTokenClaims]);

  if (!user) {
    return <UserInfoSkeleton />;
  }

  const { sub: id, username, avatar } = user;

  return (
    <>
      <div
        ref={anchorRef}
        className={classNames(styles.container, showDropdown && styles.active)}
        onClick={() => {
          setShowDropdown(true);
        }}
      >
        <img src={avatar || generateAvatarPlaceHolderById(id)} />
        <div className={styles.wrapper}>
          <div className={styles.name}>{username}</div>
        </div>
      </div>
      <Dropdown
        anchorRef={anchorRef}
        className={styles.dropdown}
        isOpen={showDropdown}
        horizontalAlign="end"
        onClose={() => {
          setShowDropdown(false);
        }}
      >
        <DropdownItem
          className={classNames(styles.dropdownItem, isLoading && styles.loading)}
          icon={<SignOut className={styles.signOutIcon} />}
          onClick={(event: MouseEvent<HTMLLIElement>) => {
            event.stopPropagation();

            if (isLoading) {
              return;
            }
            setIsLoading(true);
            void signOut(`${window.location.origin}/console`);
          }}
        >
          {t('sign_out')}
          {isLoading && <Spinner className={styles.spinner} />}
        </DropdownItem>
      </Dropdown>
    </>
  );
};

export default UserInfo;
