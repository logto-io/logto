import { type ConsentInfoResponse } from '@logto/schemas';
import classNames from 'classnames';
import { type ReactNode } from 'react';

import CheckMark from '@/assets/icons/check-mark.svg?react';
import OrganizationIcon from '@/assets/icons/organization-icon.svg?react';
import { onKeyDownHandler } from '@/utils/a11y';

import styles from './index.module.scss';

export type Organization = Exclude<ConsentInfoResponse['organizations'], undefined>[number];

type OrganizationItemProps = {
  readonly className?: string;
  readonly organization: Organization;
  readonly onSelect?: (organization: Organization) => void;
  readonly isSelected?: boolean;
  readonly suffixElement?: ReactNode;
};

const OrganizationItem = ({
  organization,
  onSelect,
  isSelected,
  suffixElement,
  className,
}: OrganizationItemProps) => {
  return (
    <div
      className={classNames(styles.organizationItem, className)}
      data-selected={isSelected}
      {...(onSelect && {
        role: 'button',
        tabIndex: 0,
        onClick: () => {
          onSelect(organization);
        },
        onKeyDown: onKeyDownHandler(() => {
          onSelect(organization);
        }),
      })}
    >
      {isSelected ? (
        <CheckMark className={styles.icon} />
      ) : (
        <OrganizationIcon className={styles.icon} />
      )}
      <div className={styles.organizationName}>{organization.name}</div>
      {suffixElement}
    </div>
  );
};

export default OrganizationItem;
