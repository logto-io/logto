import { ReservedResource } from '@logto/core-kit';
import classNames from 'classnames';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import ExpandableIcon from '@/assets/icons/expandable-icon.svg';
import { isDevFeaturesEnabled } from '@/constants/env';

import ScopeGroup from '../ScopeGroup';

import OrganizationItem, { type Organization } from './OrganizationItem';
import OrganizationSelectorModal from './OrganizationSelectorModal';
import * as styles from './index.module.scss';

export { type Organization } from './OrganizationItem';

type Props = {
  readonly organizations: Organization[];
  readonly selectedOrganization: Organization | undefined;
  readonly onSelect: (organization: Organization) => void;
  readonly className?: string;
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

  // Todo @xiaoyijun remove dev flag
  const { missingResourceScopes: resourceScopes } = isDevFeaturesEnabled
    ? selectedOrganization
    : {
        missingResourceScopes: [],
      };

  return (
    <div className={className}>
      <div className={styles.title}>
        {t(
          `description.${
            isDevFeaturesEnabled ? 'authorize_organization_access' : 'grant_organization_access'
          }`
        )}
      </div>
      {resourceScopes && resourceScopes.length > 0 && (
        <div className={styles.scopeListWrapper}>
          {resourceScopes
            .slice()
            // Sort the scopes to make sure the organization scope is always on top
            .sort(({ resource: resourceA }, { resource: resourceB }) => {
              if (resourceA.id === ReservedResource.Organization) {
                return -1;
              }
              return resourceB.id === ReservedResource.Organization ? 1 : 0;
            })
            .map(({ resource, scopes }) => (
              <ScopeGroup
                key={resource.id}
                groupName={
                  resource.id === ReservedResource.Organization
                    ? t('description.organization_scopes')
                    : resource.name
                }
                scopes={scopes}
                isAutoExpand={resourceScopes.length === 1}
              />
            ))}
        </div>
      )}
      <div
        ref={parentElementRef}
        className={classNames(
          styles.cardWrapper,
          isDevFeaturesEnabled && // Todo @xiaoyijun remove dev feature flag
            resourceScopes &&
            resourceScopes.length > 0 &&
            styles.withoutTopRadius
        )}
        data-active={showDropdown}
      >
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
