import { ReservedResource } from '@logto/core-kit';
import classNames from 'classnames';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import ExpandableIcon from '@/assets/icons/expandable-icon.svg?react';

import ScopeGroup from '../ScopeGroup';

import OrganizationItem, { type Organization } from './OrganizationItem';
import OrganizationSelectorModal from './OrganizationSelectorModal';
import styles from './index.module.scss';

export { type Organization } from './OrganizationItem';

type ResourceScopes = NonNullable<Organization['missingResourceScopes']>;

const mergeResourceScopes = (
  resourceScopes: ResourceScopes,
  scopesToMerge: ResourceScopes
): ResourceScopes =>
  scopesToMerge.reduce<ResourceScopes>((mergedResourceScopes, resourceScope) => {
    const existingResourceScope = mergedResourceScopes.find(
      ({ resource }) => resource.id === resourceScope.resource.id
    );

    if (!existingResourceScope) {
      return [...mergedResourceScopes, resourceScope];
    }

    return mergedResourceScopes.map((candidate) =>
      candidate.resource.id === resourceScope.resource.id
        ? {
            ...candidate,
            scopes: [
              ...candidate.scopes,
              ...resourceScope.scopes.filter(
                ({ id }) => !candidate.scopes.some((scope) => scope.id === id)
              ),
            ],
          }
        : candidate
    );
  }, resourceScopes);

type Props = {
  readonly organizations: Organization[];
  readonly selectedOrganizations: Organization[];
  readonly isMultiSelectEnabled: boolean;
  readonly onToggle: (organization: Organization) => void;
  readonly className?: string;
};

const OrganizationSelector = ({
  organizations,
  selectedOrganizations,
  isMultiSelectEnabled,
  onToggle,
  className,
}: Props) => {
  const { t } = useTranslation();
  const parentElementRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  if (organizations.length === 0 || selectedOrganizations.length === 0) {
    return null;
  }

  const resourceScopes = selectedOrganizations.reduce<ResourceScopes>(
    (resourceScopes, { missingResourceScopes = [] }) =>
      mergeResourceScopes(resourceScopes, missingResourceScopes),
    []
  );

  return (
    <div className={className}>
      <div className={styles.title}>{t(`description.authorize_organization_access`)}</div>
      {resourceScopes.length > 0 && (
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
          resourceScopes.length > 0 && styles.withoutTopRadius
        )}
        data-active={showDropdown}
      >
        {selectedOrganizations.map((organization, index) => (
          <OrganizationItem
            key={organization.id}
            className={styles.selectedOrganization}
            organization={organization}
            suffixElement={
              index === 0 ? <ExpandableIcon className={styles.expandButton} /> : undefined
            }
            onSelect={() => {
              setShowDropdown(true);
            }}
          />
        ))}
      </div>
      <OrganizationSelectorModal
        isOpen={showDropdown}
        parentElementRef={parentElementRef}
        organizations={organizations}
        selectedOrganizations={selectedOrganizations}
        isMultiSelectEnabled={isMultiSelectEnabled}
        onToggle={onToggle}
        onClose={() => {
          setShowDropdown(false);
        }}
      />
    </div>
  );
};

export default OrganizationSelector;
