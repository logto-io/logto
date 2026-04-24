import { ossUpsellEntries } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';
import { Trans } from 'react-i18next';

import { CloudTag } from '@/components/FeatureTag';
import { latestProPlanId } from '@/consts/subscriptions';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextLink from '@/ds-components/TextLink';
import { getCloudUpsellTargetUrl, openCloudUpsell } from '@/utils/oss-upsell';

import type { SignInExperienceForm } from '../../../types';

import styles from './index.module.scss';

type Props = {
  readonly variant: 'cloud' | 'oss';
  readonly isEnabledInCloud: boolean;
};

function HideLogtoBrandingField({ variant, isEnabledInCloud }: Props) {
  const { register } = useFormContext<SignInExperienceForm>();

  if (variant === 'cloud') {
    return (
      <FormField
        title="sign_in_exp.branding.hide_logto_branding"
        featureTag={{
          isVisible: !isEnabledInCloud,
          plan: latestProPlanId,
        }}
      >
        <Switch
          description="sign_in_exp.branding.hide_logto_branding_description"
          {...register('hideLogtoBranding')}
          disabled={!isEnabledInCloud}
        />
      </FormField>
    );
  }

  return (
    <FormField
      title={
        <div className={styles.titleRow}>
          <DynamicT forKey="sign_in_exp.branding.hide_logto_branding" />
          <CloudTag>
            <DynamicT forKey="sign_in_exp.custom_ui.cloud_tag" />
          </CloudTag>
        </div>
      }
    >
      <Switch
        disabled
        readOnly
        description="sign_in_exp.branding.hide_logto_branding_description"
        checked={false}
      />
      <div className={styles.ossNote}>
        <Trans
          i18nKey="admin_console.sign_in_exp.branding.hide_logto_branding_oss_note"
          components={{
            a: (
              <TextLink
                href={getCloudUpsellTargetUrl()}
                targetBlank="noopener"
                className={styles.highlight}
                onClick={(event) => {
                  event.preventDefault();
                  openCloudUpsell({
                    entry: ossUpsellEntries.signInExpHideLogtoBrandingOssNote,
                  });
                }}
              />
            ),
          }}
        />
      </div>
    </FormField>
  );
}

export default HideLogtoBrandingField;
