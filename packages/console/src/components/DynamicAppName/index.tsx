import { type GetUserApplicationGrantsResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ExternalLinkIcon from '@/assets/icons/external-link.svg?react';
import Tag from '@/ds-components/Tag';
import TextLink from '@/ds-components/TextLink';
import { Tooltip } from '@/ds-components/Tip';
import { type RequestError } from '@/hooks/use-api';

import styles from './index.module.scss';

type Props = {
  /** The CIMD client identifier URL. */
  readonly clientId: string;
  /**
   * The consent-time snapshot name, when the caller already holds one (e.g. the grants
   * tab). The backend falls back to the identifier itself when the metadata document has
   * no `client_name`, and an empty string can come through as well — both mean "unnamed".
   */
  readonly name?: string;
  /**
   * Resolve the snapshot name from this user's active grants when the caller has no name
   * at hand — the same fetch-per-row pattern as `ApplicationName`. A user without a
   * matching grant (revoked, or deleted user: the grants endpoint returns an empty list,
   * not a 404) falls back to the identifier host.
   */
  readonly userId?: string;
};

/**
 * The display name of a dynamic app (CIMD) client. It is a URL identity with no
 * applications row behind it, so the name links to the client identifier URL (the metadata
 * document) instead of an application details page; an unnamed client shows its identifier
 * host, matching the consent page.
 */
function DynamicAppName({ clientId, name, userId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { data } = useSWR<GetUserApplicationGrantsResponse, RequestError>(
    conditional(!name && userId && `api/users/${userId}/grants?appType=thirdParty`)
  );
  const resolvedName =
    name ?? data?.grants.find((grant) => grant.payload.clientId === clientId)?.application.name;

  return (
    <div className={styles.container}>
      <Tooltip className={styles.tooltip} anchorClassName={styles.anchor} content={clientId}>
        <TextLink
          isTrailingIcon
          targetBlank
          className={styles.link}
          href={clientId}
          icon={<ExternalLinkIcon className={styles.icon} />}
        >
          <span className={styles.name}>
            {resolvedName && resolvedName !== clientId ? resolvedName : new URL(clientId).host}
          </span>
        </TextLink>
      </Tooltip>
      <Tag className={styles.tag}>{t('applications.dynamic_app.title')}</Tag>
    </div>
  );
}

export default DynamicAppName;
