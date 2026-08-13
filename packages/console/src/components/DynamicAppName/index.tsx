import { useTranslation } from 'react-i18next';

import ExternalLinkIcon from '@/assets/icons/external-link.svg?react';
import Tag from '@/ds-components/Tag';
import TextLink from '@/ds-components/TextLink';
import { Tooltip } from '@/ds-components/Tip';

import styles from './index.module.scss';
import { getDynamicAppDisplayName } from './utils';

type Props = {
  /** The CIMD client identifier URL. */
  readonly clientId: string;
  /**
   * The consent-time snapshot name carried in the grants response. The backend falls back
   * to the identifier itself when the metadata document has no `client_name`, and an
   * empty string can come through as well — both render the identifier host instead.
   */
  readonly name?: string;
  /** Whether to append the "Dynamic app" kind tag. Kept off in dense tables. */
  readonly hasTag?: boolean;
};

/**
 * The display identity of a dynamic app (CIMD) client on management surfaces (e.g. the
 * user's third-party apps list). It is a URL identity with no applications row behind it,
 * so the name links to the client identifier URL (the metadata document) instead of an
 * application details page; an unnamed client shows its identifier host, matching the
 * consent page. Forensic surfaces render the raw identifier via `ClientIdentifier`
 * instead.
 */
function DynamicAppName({ clientId, name, hasTag = false }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

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
          <span className={styles.name}>{getDynamicAppDisplayName(clientId, name)}</span>
        </TextLink>
      </Tooltip>
      {hasTag && <Tag className={styles.tag}>{t('applications.dynamic_app.title')}</Tag>}
    </div>
  );
}

export default DynamicAppName;
