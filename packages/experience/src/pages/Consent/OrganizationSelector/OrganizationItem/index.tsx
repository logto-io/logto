import { type ConsentInfoResponse } from '@logto/schemas';
import { type ReactNode } from 'react';

import CheckMark from '@/assets/icons/check-mark.svg';
import OrganizationIcon from '@/assets/icons/organization-icon.svg';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

export type Organization = Exclude<ConsentInfoResponse['organizations'], undefined>[number];

type OrganizationItemProps = {
  organization: Organization;
  onSelect?: (organization: Organization) => void;
  isSelected?: boolean;
  suffixElement?: ReactNode;
};

const OrganizationItem = ({
  organization,
  onSelect,
  isSelected,
  suffixElement,
}: OrganizationItemProps) => {
  return (
    <div
      className={styles.organizationItem}
      data-selected={isSelected}
      {...(onSelect && {
        role: 'button',
        tabIndex: 0,
        onClick: () => {
          onSelect(organization);
        },
        onKeyDown: () => {
          onKeyDownHandler({
            Enter: () => {
              onSelect(organization);
            },
            ' ': () => {
              onSelect(organization);
            },
          });
        },
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
