import { ossUpsellEntries } from '@logto/schemas';
import { useContext } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import CloudUploadIcon from '@/assets/icons/cloud-upload.svg?react';
import CustomCssEditorField from '@/components/CustomCssEditorField';
import { CloudTag } from '@/components/FeatureTag';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Card from '@/ds-components/Card';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTrackedCloudUpsellLink from '@/hooks/use-tracked-cloud-upsell-link';
import CustomUiAssetsUploader from '@/pages/SignInExperience/components/CustomUiAssetsUploader';

import type { SignInExperienceForm } from '../../../types';
import FormSectionTitle from '../../components/FormSectionTitle';

import styles from './index.module.scss';

function OssBringYourUiCard() {
  const cloudUpsellLink = useTrackedCloudUpsellLink(ossUpsellEntries.signInExpBringYourUiOssCard);

  return (
    <FormField
      title={
        <div className={styles.titleRow}>
          <DynamicT forKey="sign_in_exp.custom_ui.bring_your_ui_title" />
          <CloudTag>
            <DynamicT forKey="sign_in_exp.custom_ui.cloud_tag" />
          </CloudTag>
        </div>
      }
      description={
        <Trans i18nKey="admin_console.sign_in_exp.custom_ui.bring_your_ui_oss_description" />
      }
      descriptionPosition="top"
    >
      <div className={styles.ossCard}>
        <div className={styles.ossCardContent}>
          <div className={styles.ossCardIcon}>
            <CloudUploadIcon />
          </div>
          <div className={styles.ossCardDescription}>
            <Trans
              i18nKey="admin_console.sign_in_exp.custom_ui.bring_your_ui_oss_card_description"
              components={{
                a: (
                  <TextLink
                    targetBlank="noopener"
                    className={styles.highlight}
                    {...cloudUpsellLink}
                  />
                ),
              }}
            />
          </div>
        </div>
      </div>
    </FormField>
  );
}

function CustomUiForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const { control } = useFormContext<SignInExperienceForm>();
  const { currentSubscriptionQuota } = useContext(SubscriptionDataContext);
  const isBringYourUiEnabled = currentSubscriptionQuota.bringYourUiEnabled;
  const shouldShowOssBringYourUi = !isCloud && isDevFeaturesEnabled;

  return (
    <Card>
      <FormSectionTitle title="custom_ui.title" />
      <CustomCssEditorField />
      {isCloud && (
        <FormField
          title="sign_in_exp.custom_ui.bring_your_ui_title"
          description={
            <Trans
              components={{
                a: (
                  <TextLink
                    targetBlank="noopener"
                    href={getDocumentationUrl('/docs/recipes/customize-sie/bring-your-ui')}
                  />
                ),
              }}
            >
              {t('sign_in_exp.custom_ui.bring_your_ui_description')}
            </Trans>
          }
          descriptionPosition="top"
          featureTag={{
            isVisible: !isBringYourUiEnabled,
            plan: latestProPlanId,
          }}
        >
          <Controller
            name="customUiAssets"
            control={control}
            render={({ field: { onChange, value } }) => (
              <CustomUiAssetsUploader
                disabled={!isBringYourUiEnabled}
                value={value}
                onChange={onChange}
              />
            )}
          />
        </FormField>
      )}
      {shouldShowOssBringYourUi && <OssBringYourUiCard />}
    </Card>
  );
}

export default CustomUiForm;
