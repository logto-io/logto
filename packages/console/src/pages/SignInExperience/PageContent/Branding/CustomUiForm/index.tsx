import { useContext } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import CustomCssEditorField from '@/components/CustomCssEditorField';
import { isCloud } from '@/consts/env';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Card from '@/ds-components/Card';
import FormField from '@/ds-components/FormField';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import CustomUiAssetsUploader from '@/pages/SignInExperience/components/CustomUiAssetsUploader';

import type { SignInExperienceForm } from '../../../types';
import FormSectionTitle from '../../components/FormSectionTitle';

function CustomUiForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const { control } = useFormContext<SignInExperienceForm>();
  const { currentSubscriptionQuota } = useContext(SubscriptionDataContext);
  const isBringYourUiEnabled = currentSubscriptionQuota.bringYourUiEnabled;

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
    </Card>
  );
}

export default CustomUiForm;
