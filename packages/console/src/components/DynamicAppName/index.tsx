import { useTranslation } from 'react-i18next';

import ExternalLinkIcon from '@/assets/icons/external-link.svg?react';
import Tag from '@/ds-components/Tag';
import TextLink from '@/ds-components/TextLink';
import { Tooltip } from '@/ds-components/Tip';

import styles from './index.module.scss';

type Props = {
  /** The CIMD client identifier URL. */
  readonly clientId: string;
  /**
   * The consent-time snapshot name, when the context carries one (e.g. the grants
   * response). The backend falls back to the identifier itself when the metadata document
   * has no `client_name`, and an empty string can come through as well — both mean
   * "unnamed", as does omitting the prop where no name source exists (e.g. a session's
   * authorized clients).
   */
  readonly name?: string;
};

/**
 * The display name of a dynamic app (CIMD) client. It is a URL identity with no
 * applications row behind it, so the name links to the client identifier URL (the metadata
 * document) instead of an application details page; an unnamed client shows its identifier
 * host, matching the consent page.
 */
function DynamicAppName({ clientId, name }: Props) {
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
          <span className={styles.name}>
            {name && name !== clientId ? name : new URL(clientId).host}
          </span>
        </TextLink>
      </Tooltip>
      <Tag className={styles.tag}>{t('applications.dynamic_app.title')}</Tag>
    </div>
  );
}

export default DynamicAppName;
