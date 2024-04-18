import { TenantTag } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import TenantEnvTag from '@/components/TenantEnvTag';
import { envTagsFeatureLink } from '@/consts';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import * as styles from './index.module.scss';

type Props = {
  readonly tag: TenantTag;
};

function TenantEnvironment({ tag }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();

  return (
    <div className={styles.container}>
      <TenantEnvTag isAbbreviated={false} size="large" tag={tag} />
      <div className={styles.description}>
        <Trans
          components={{
            a: <TextLink targetBlank="noopener" href={getDocumentationUrl(envTagsFeatureLink)} />,
          }}
        >
          {t(
            tag === TenantTag.Development
              ? 'tenants.settings.development_description'
              : 'tenants.settings.production_description'
          )}
        </Trans>
      </div>
    </div>
  );
}

export default TenantEnvironment;
