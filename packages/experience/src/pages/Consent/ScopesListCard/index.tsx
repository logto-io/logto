import { ReservedResource, UserScope } from '@logto/core-kit';
import { type ConsentInfoResponse } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import DownArrowIcon from '@/assets/icons/arrow-down.svg';
import CheckMark from '@/assets/icons/check-mark.svg';
import TermsLinks from '@/components/TermsLinks';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

const isUserScope = (scope: string): scope is UserScope =>
  Object.values<string>(UserScope).includes(scope);

type ScopeGroupProps = {
  groupName: string;
  isAutoExpand?: boolean;
  scopes: Array<{
    id: string;
    name: string;
    description?: Nullable<string>; // Organization scope description cloud be `null`
  }>;
};

const ScopeGroup = ({ groupName, scopes, isAutoExpand = false }: ScopeGroupProps) => {
  const [expanded, setExpanded] = useState(isAutoExpand);

  const toggle = useCallback(() => {
    setExpanded((previous) => !previous);
  }, []);

  return (
    <div className={classNames(styles.scopeGroup)}>
      <div
        className={styles.scopeGroupHeader}
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={onKeyDownHandler(toggle)}
      >
        <CheckMark className={styles.check} />
        <div className={styles.scopeGroupName}>{groupName}</div>
        <DownArrowIcon className={styles.toggleButton} data-expanded={expanded} />
      </div>
      {expanded && (
        <ul className={styles.scopesList}>
          {scopes.map(({ id, name, description }) => (
            <li key={id} className={styles.scopeItem}>
              {description ?? name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

type Props = {
  userScopes: ConsentInfoResponse['missingOIDCScope'];
  resourceScopes: ConsentInfoResponse['missingResourceScopes'];
  appName: string;
  className?: string;
  termsUrl?: string;
  privacyUrl?: string;
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

  const showTerms = Boolean(termsUrl ?? privacyUrl);

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
      <div className={styles.title}>{t('description.request_permission', { name: appName })}</div>
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
              resource.name === ReservedResource.Organization
                ? t('description.organization_scopes')
                : resource.name
            }
            scopes={scopes}
            // If there is no user scopes, we should auto expand the resource scopes
            isAutoExpand={!userScopesData?.length && resourceScopes.length === 1}
          />
        ))}
        {showTerms && (
          <div className={styles.terms}>
            <Trans
              components={{
                link: <TermsLinks inline termsOfUseUrl={termsUrl} privacyPolicyUrl={privacyUrl} />,
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
