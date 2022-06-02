import { useLogto, UserInfoResponse } from '@logto/react';
import { UserRole } from '@logto/schemas';
import classNames from 'classnames';
import React, { useEffect, useRef, useState, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown, { DropdownItem } from '@/components/Dropdown';
import Spinner from '@/components/Spinner';
import { getAvatarById } from '@/consts/avatars';
import useApi from '@/hooks/use-api';
import SignOut from '@/icons/SignOut';

import * as styles from './index.module.scss';

const UserInfo = () => {
  const { isAuthenticated, fetchUserInfo, signOut } = useLogto();
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showDropDown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<UserInfoResponse>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        const userInfo = await fetchUserInfo();
        setUser(userInfo);
      }
    })();
  }, [api, isAuthenticated, fetchUserInfo]);

  if (!user) {
    return null;
  }

  const { sub: id, name, avatar, role_names: roleNames } = user;
  const isAdmin = roleNames?.includes(UserRole.Admin);

  return (
    <>
      <div
        ref={anchorRef}
        className={classNames(styles.container, showDropDown && styles.active)}
        onClick={() => {
          setShowDropdown(true);
        }}
      >
        <img src={avatar ?? getAvatarById(id)} />
        <div className={styles.wrapper}>
          <div className={styles.name}>{name}</div>
          {isAdmin && <div className={styles.role}>{t('user_details.roles.admin')}</div>}
        </div>
      </div>
      <Dropdown
        anchorRef={anchorRef}
        className={styles.dropdown}
        isOpen={showDropDown}
        horizontalAlign="end"
        onClose={() => {
          setShowDropdown(false);
        }}
      >
        <DropdownItem
          className={classNames(styles.dropdownItem, isLoading && styles.loading)}
          icon={<SignOut />}
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
