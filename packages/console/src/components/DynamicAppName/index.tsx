import { type CimdGrantClientSnapshot } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ExternalLinkIcon from '@/assets/icons/external-link.svg?react';
import Tag from '@/ds-components/Tag';
import TextLink from '@/ds-components/TextLink';
import { Tooltip } from '@/ds-components/Tip';
import useApi, { type RequestError } from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';
import { shouldRetryOnError } from '@/utils/request';
import { buildUrl } from '@/utils/url';

import styles from './index.module.scss';
import { getDynamicAppDisplayName } from './utils';

type Props = {
  /** The CIMD client identifier URL. */
  readonly clientId: string;
  /**
   * The consent-time snapshot name, when the caller already holds one (e.g. the grants
   * tab). The backend falls back to the identifier itself when the metadata document has
   * no `client_name`, and an empty string can come through as well — both mean "unnamed".
   * Without it, the component resolves the snapshot lookup endpoint — the same
   * fetch-per-row pattern as `ApplicationName`.
   */
  readonly name?: string;
};

/** The `/api/cimd/client-snapshot` response: the snapshot without its FK plumbing. */
type ClientSnapshot = Pick<CimdGrantClientSnapshot, 'clientId' | 'name' | 'logoUri' | 'createdAt'>;

/**
 * The display name of a dynamic app (CIMD) client. It is a URL identity with no
 * applications row behind it, so the name links to the client identifier URL (the metadata
 * document) instead of an application details page; a client with no resolvable snapshot
 * name shows its identifier host, matching the consent page.
 */
function DynamicAppName({ clientId, name }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const fetchApi = useApi({ hideErrorToast: ['entity.not_found'] });
  const fetcher = useSwrFetcher<ClientSnapshot>(fetchApi);
  const { data } = useSWR<ClientSnapshot, RequestError>(
    conditional(!name && buildUrl('api/cimd/client-snapshot', { clientId })),
    {
      fetcher,
      shouldRetryOnError: shouldRetryOnError({ ignore: [404] }),
    }
  );
  const resolvedName = name ?? data?.name;

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
            {getDynamicAppDisplayName(clientId, resolvedName ?? undefined)}
          </span>
        </TextLink>
      </Tooltip>
      <Tag className={styles.tag}>{t('applications.dynamic_app.title')}</Tag>
    </div>
  );
}

export default DynamicAppName;
