import { type ApplicationApiResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { logtoThirdPartyAppPermissionsLink } from '@/consts';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import OidcPermissionsCard from './OidcPermissionsCard';
import PermissionsCard from './PermissionsCard';
import { ScopeLevel } from './PermissionsCard/ApplicationScopesAssignmentModal/type';
import styles from './index.module.scss';

type Props = {
  readonly application: ApplicationApiResponse;
};

function Permissions({ application }: Props) {
  const { getDocumentationUrl } = useDocumentationUrl();

  return (
    <div className={styles.container}>
      {[ScopeLevel.User, ScopeLevel.Organization].map((scopeLevel) => (
        <PermissionsCard
          key={scopeLevel}
          scopesEndpoint={`api/applications/${application.id}/user-consent-scopes`}
          scopeLevel={scopeLevel}
          phraseGroup="application_details.permissions"
          learnMoreLink={conditional(
            scopeLevel === ScopeLevel.User && {
              href: getDocumentationUrl(logtoThirdPartyAppPermissionsLink),
              targetBlank: 'noopener',
            }
          )}
        />
      ))}
      <OidcPermissionsCard />
    </div>
  );
}

export default Permissions;
