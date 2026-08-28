import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import { LinkButton } from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextLink from '@/ds-components/TextLink';
import { buildCloudUpsellUrl, buildSelfHostedPlansUrl, ossUpsellEntries } from '@/utils/oss-upsell';

import styles from './index.module.scss';

function OssUpsell() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
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
        <div className={styles.ossActions}>
          <LinkButton
            type="primary"
            title={
              <DangerousRaw>
                {t('upsell.try_with_product_name', { productName: 'Logto Cloud' })}
              </DangerousRaw>
            }
            href={cloudUpsellUrl}
            targetBlank="noopener"
          />
          <TextLink href={selfHostedPlansUrl} targetBlank="noopener">
            {t('upsell.explore_self_hosted_plans')}
          </TextLink>
        </div>
      </div>
    </FormCard>
  );
}

export default OssUpsell;
