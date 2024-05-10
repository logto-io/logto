import { ReservedResource, UserScope } from '@logto/core-kit';
import { type ConsentInfoResponse } from '@logto/schemas';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import TermsLinks from '@/components/TermsLinks';
import { isDevFeaturesEnabled } from '@/constants/env';

import ScopeGroup from '../ScopeGroup';

import * as styles from './index.module.scss';

const isUserScope = (scope: string): scope is UserScope =>
  Object.values<string>(UserScope).includes(scope);

type Props = {
  readonly userScopes: ConsentInfoResponse['missingOIDCScope'];
  readonly resourceScopes: ConsentInfoResponse['missingResourceScopes'];
  readonly appName: string;
  readonly className?: string;
  readonly termsUrl?: string;
  readonly privacyUrl?: string;
};

const ScopesListCard = ({
  userScopes,
  resourceScopes,
  appName,
  termsUrl,
  privacyUrl,
  className,
}: Props) => {
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

  // Todo @xiaoyijun remove dev feature flag and authorization agreement from this component
  const showTerms = !isDevFeaturesEnabled && Boolean(termsUrl ?? privacyUrl);

  // If there is no user scopes and resource scopes, we don't need to show the scopes list.
  // This is a fallback for the corner case that all the scopes are already granted.
  if (!userScopesData?.length && !resourceScopes?.length) {
    return showTerms ? (
      <div className={className}>
        <Trans
          components={{
            link: <TermsLinks inline termsOfUseUrl={termsUrl} privacyPolicyUrl={privacyUrl} />,
          }}
        >
          {t('description.authorize_agreement', { name: appName })}
        </Trans>
      </div>
    ) : null;
  }

  return (
    <div className={className}>
      <div className={styles.title}>
        {t(
          `description.${
            isDevFeaturesEnabled ? 'authorize_personal_data_usage' : 'request_permission'
          }`,
          { name: appName }
        )}
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
            groupName={
              // Todo @xiaoyijun remove this when the org scopes display in the new card
              resource.id === ReservedResource.Organization
                ? t('description.organization_scopes')
                : resource.name
            }
            scopes={scopes}
            // If there is no user scopes, we should auto expand the resource scopes
            isAutoExpand={!userScopesData?.length && resourceScopes.length === 1}
          />
        ))}
        {!isDevFeaturesEnabled && // Todo @xiaoyijun remove dev feature flag
          showTerms && (
            <div className={styles.terms}>
              <Trans
                components={{
                  link: (
                    <TermsLinks inline termsOfUseUrl={termsUrl} privacyPolicyUrl={privacyUrl} />
                  ),
                }}
              >
                {t('description.authorize_agreement', { name: appName })}
              </Trans>
            </div>
          )}
      </div>
    </div>
  );
};

export default ScopesListCard;
