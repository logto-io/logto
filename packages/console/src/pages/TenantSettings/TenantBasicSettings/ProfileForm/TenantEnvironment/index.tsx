import { TenantTag } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import TenantEnvTag from '@/components/TenantEnvTag';
import TextLink from '@/ds-components/TextLink';

import * as styles from './index.module.scss';

type Props = {
  tag: TenantTag;
};

function TenantEnvironment({ tag }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <TenantEnvTag isAbbreviated={false} size="large" tag={tag} />
      <div className={styles.description}>
        <Trans
          components={{
            // Todo PRD-591 @xiaoyijun Add related link
            a: <TextLink href="" target="_blank" rel="noopener" />,
          }}
        >
          {t(
            tag === TenantTag.Development
              ? 'tenants.settings.development_description'
              : 'tenants.create_modal.production_description'
          )}
        </Trans>
      </div>
    </div>
  );
}

export default TenantEnvironment;
