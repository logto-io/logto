import { ReservedResource } from '@logto/core-kit';
import { type MissingResourceScopes } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import OrganizationIcon from '@/assets/icons/organization-icon.svg?react';
import Checkbox from '@/components/Checkbox';
import { onKeyDownHandler } from '@/shared/utils/a11y';

import { type Organization } from '../OrganizationSelector';
import ScopeGroup from '../ScopeGroup';

import styles from './index.module.scss';

type Props = {
  readonly organizations: Organization[];
  readonly selectedOrganizations: Organization[];
  /**
   * The organization-facing part of the requested scope ceiling. It applies to every organization
   * alike, so it renders once above the roster instead of per organization.
   */
  readonly resourceScopes?: MissingResourceScopes[];
  readonly onToggle: (organization: Organization) => void;
  readonly className?: string;
};

/**
 * The multi-select organization roster for registered third-party applications. Organizations the
 * user has already consented to render pre-checked and locked: a later consent round can only add
 * organizations, never withdraw one.
 */
const OrganizationRoster = ({
  organizations,
  selectedOrganizations,
  resourceScopes = [],
  onToggle,
  className,
}: Props) => {
  const { t } = useTranslation();

  if (organizations.length === 0) {
    return null;
  }

  const hasScopes = resourceScopes.length > 0;

  return (
    <div className={className}>
      <div className={styles.title}>{t('description.authorize_organizations_access')}</div>
      {hasScopes && (
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
      <div className={classNames(styles.roster, hasScopes && styles.withoutTopRadius)}>
        {organizations.map((organization) => {
          const isSelected = selectedOrganizations.some(({ id }) => id === organization.id);
          const isLocked = Boolean(organization.isConsented);

          return (
            <div
              key={organization.id}
              className={styles.row}
              role="checkbox"
              aria-checked={isSelected}
              aria-disabled={isLocked}
              tabIndex={isLocked ? -1 : 0}
              {...(!isLocked && {
                onClick: () => {
                  onToggle(organization);
                },
                onKeyDown: onKeyDownHandler(() => {
                  onToggle(organization);
                }),
              })}
            >
              <Checkbox checked={isSelected} disabled={isLocked} tabIndex={-1} />
              <OrganizationIcon className={styles.icon} />
              <div className={styles.name}>{organization.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrganizationRoster;
