import { useTranslation } from 'react-i18next';

import Tag from '@/ds-components/Tag';

import styles from './index.module.scss';

type Props = {
  /** The CIMD client identifier URL. */
  readonly clientId: string;
  /**
   * The consent-time snapshot name carried in the grants response. When the metadata
   * document has no `client_name`, the backend falls back to the identifier itself — and
   * an empty string can come through as well. Both mean "unnamed".
   */
  readonly name: string;
};

/**
 * The display name of a dynamic app (CIMD) client. It is a URL identity with no
 * applications row behind it, so there is no details page to link to; an unnamed client
 * shows its identifier host instead, matching the consent page.
 */
function DynamicAppName({ clientId, name }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <span className={styles.name}>
        {name && name !== clientId ? name : new URL(clientId).host}
      </span>
      <Tag className={styles.tag}>{t('applications.dynamic_app.title')}</Tag>
    </div>
  );
}

export default DynamicAppName;
