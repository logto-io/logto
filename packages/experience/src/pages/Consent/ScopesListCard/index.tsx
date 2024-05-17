import { UserScope } from '@logto/core-kit';
import { type ConsentInfoResponse } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ScopeGroup from '../ScopeGroup';

import * as styles from './index.module.scss';

const isUserScope = (scope: string): scope is UserScope =>
  Object.values<string>(UserScope).includes(scope);

type Props = {
  readonly userScopes: ConsentInfoResponse['missingOIDCScope'];
  readonly resourceScopes: ConsentInfoResponse['missingResourceScopes'];
  readonly appName: string;
  readonly className?: string;
};

const ScopesListCard = ({ userScopes, resourceScopes, appName, className }: Props) => {
  const { t } = useTranslation();

  const userScopesData = useMemo(
    () =>
      userScopes?.map((scope) => ({
        id: scope,
        name: scope,
        description: isUserScope(scope)
          ? // We have ':' in the user scope, need to change the nsSeparator to '|' to avoid i18n ns matching
            t(`user_scopes.descriptions.${scope}`, { nsSeparator: '|' })
          : undefined,
      })),
    [t, userScopes]
  );

  // If there is no user scopes and resource scopes, we don't need to show the scopes list.
  if (!userScopesData?.length && !resourceScopes?.length) {
    return null;
  }

  return (
    <div className={className}>
      <div className={styles.title}>
        {t(`description.authorize_personal_data_usage`, { name: appName })}
      </div>
      <div className={styles.cardWrapper}>
        {userScopesData && userScopesData.length > 0 && (
          <ScopeGroup
            groupName="User Scopes"
            scopes={userScopesData}
            // If there is no resource scopes, we should auto expand the user scopes
            isAutoExpand={!resourceScopes?.length}
          />
        )}
        {resourceScopes?.map(({ resource, scopes }) => (
          <ScopeGroup
            key={resource.id}
            groupName={resource.name}
            scopes={scopes}
            // If there is no user scopes, we should auto expand the resource scopes
            isAutoExpand={!userScopesData?.length && resourceScopes.length === 1}
          />
        ))}
      </div>
    </div>
  );
};

export default ScopesListCard;
