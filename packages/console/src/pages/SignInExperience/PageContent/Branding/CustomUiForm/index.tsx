import { ReservedPlanId } from '@logto/schemas';
import { useContext } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import InlineUpsell from '@/components/InlineUpsell';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Card from '@/ds-components/Card';
import CodeEditor from '@/ds-components/CodeEditor';
import FormField from '@/ds-components/FormField';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import CustomUiAssetsUploader from '@/pages/SignInExperience/components/CustomUiAssetsUploader';

import type { SignInExperienceForm } from '../../../types';
import FormSectionTitle from '../../components/FormSectionTitle';

import brandingStyles from './index.module.scss';

function CustomUiForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const { control } = useFormContext<SignInExperienceForm>();
  const { currentSubscriptionQuota } = useContext(SubscriptionDataContext);
  const isBringYourUiEnabled = currentSubscriptionQuota.bringYourUiEnabled;

  return (
    <Card>
      <FormSectionTitle title="custom_ui.title" />
      <FormField
        title="sign_in_exp.custom_ui.css_code_editor_title"
        tip={(closeTipHandler) => (
          <>
            <div>{t('sign_in_exp.custom_ui.css_code_editor_description1')}</div>
            <div>
              <Trans
                components={{
                  a: (
                    <TextLink
                      targetBlank="noopener"
                      href={getDocumentationUrl('/docs/recipes/customize-sie/custom-css')}
                      onClick={closeTipHandler}
                    />
                  ),
                }}
              >
                {t('sign_in_exp.custom_ui.css_code_editor_description2', {
                  link: t('sign_in_exp.custom_ui.css_code_editor_description_link_content'),
                })}
              </Trans>
            </div>
          </>
        )}
      >
        <Controller
          name="customCss"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CodeEditor
              className={brandingStyles.customCssCodeEditor}
              language="scss"
              value={value ?? undefined}
              placeholder={t('sign_in_exp.custom_ui.css_code_editor_content_placeholder')}
              onChange={onChange}
            />
          )}
        />
      </FormField>
      {isCloud && (
        <FormField
          isBeta
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
            plan: ReservedPlanId.Pro,
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
          {!isBringYourUiEnabled && (
            <InlineUpsell
              className={brandingStyles.upsell}
              for="bring_your_ui"
              actionButtonText="upsell.view_plans"
            />
          )}
        </FormField>
      )}
    </Card>
  );
}

export default CustomUiForm;
