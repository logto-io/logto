import { Trans } from 'react-i18next';

import FormCard from '@/components/FormCard';
import { LinkButton } from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextLink from '@/ds-components/TextLink';
import { buildCloudUpsellUrl, buildSelfHostedPlansUrl, ossUpsellEntries } from '@/utils/oss-upsell';

import styles from './index.module.scss';

function OssUpsell() {
  const entry = ossUpsellEntries.enterpriseSsoIdpInitiatedOssUpsell;
  const selfHostedPlansUrl = buildSelfHostedPlansUrl(entry);
  const cloudUpsellUrl = buildCloudUpsellUrl(entry);

  return (
    <FormCard
      title="enterprise_sso_details.idp_initiated_auth_config.card_title"
      description="enterprise_sso_details.idp_initiated_auth_config.card_description"
    >
      <div className={styles.ossUpsell}>
        <FormField title="enterprise_sso_details.idp_initiated_auth_config.enable_idp_initiated_sso">
          <Switch
            disabled
            readOnly
            checked={false}
            description="enterprise_sso_details.idp_initiated_auth_config.enable_idp_initiated_sso_description"
          />
        </FormField>
        <div className={styles.ossNote}>
          <Trans
            i18nKey="admin_console.enterprise_sso_details.idp_initiated_auth_config.self_hosted_note"
            components={{
              selfHosted: <TextLink href={selfHostedPlansUrl} targetBlank="noopener" />,
              a: <TextLink href={cloudUpsellUrl} targetBlank="noopener" />,
            }}
          />
        </div>
        <LinkButton
          className={styles.ossAction}
          type="primary"
          title="upsell.explore_self_hosted_plans"
          href={selfHostedPlansUrl}
          targetBlank="noopener"
        />
      </div>
    </FormCard>
  );
}

export default OssUpsell;
