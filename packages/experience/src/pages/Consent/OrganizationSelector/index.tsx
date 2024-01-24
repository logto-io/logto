import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import ExpandableIcon from '@/assets/icons/expandable-icon.svg';

import OrganizationItem, { type Organization } from './OrganizationItem';
import OrganizationSelectorModal from './OrganizationSelectorModal';
import * as styles from './index.module.scss';

export { type Organization } from './OrganizationItem';

type Props = {
  organizations: Organization[];
  selectedOrganization: Organization | undefined;
  onSelect: (organization: Organization) => void;
  className?: string;
};
const OrganizationSelector = ({
  organizations,
  selectedOrganization,
  onSelect,
  className,
}: Props) => {
  const { t } = useTranslation();
  const parentElementRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  if (organizations.length === 0 || !selectedOrganization) {
    return null;
  }

  return (
    <div className={className}>
      <div className={styles.title}>{t('description.grant_organization_access')}</div>
      <div ref={parentElementRef} className={styles.cardWrapper} data-active={showDropdown}>
        <OrganizationItem
          className={styles.selectedOrganization}
          organization={selectedOrganization}
          suffixElement={<ExpandableIcon className={styles.expandButton} />}
          onSelect={() => {
            setShowDropdown(true);
          }}
        />
      </div>
      <OrganizationSelectorModal
        isOpen={showDropdown}
        parentElementRef={parentElementRef}
        organizations={organizations}
        selectedOrganization={selectedOrganization}
        onSelect={onSelect}
        onClose={() => {
          setShowDropdown(false);
        }}
      />
    </div>
  );
};

export default OrganizationSelector;
