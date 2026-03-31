import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Trans } from 'react-i18next';

import { CloudTag } from '@/components/FeatureTag';
import { officialWebsiteLink } from '@/consts/external-links';
import { latestProPlanId } from '@/consts/subscriptions';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextLink from '@/ds-components/TextLink';

import type { SignInExperienceForm } from '../../../types';

import styles from './index.module.scss';

type Props = {
  readonly variant: 'cloud' | 'oss';
  readonly isEnabledInCloud: boolean;
};

function HideLogtoBrandingField({ variant, isEnabledInCloud }: Props) {
  const { register, setValue } = useFormContext<SignInExperienceForm>();

  useEffect(() => {
    if (variant === 'oss') {
      setValue('hideLogtoBranding', false, { shouldDirty: false });
    }
  }, [setValue, variant]);

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
        description="sign_in_exp.branding.hide_logto_branding_description"
        {...register('hideLogtoBranding')}
        disabled
      />
      <div className={styles.ossNote}>
        <Trans
          i18nKey="admin_console.sign_in_exp.branding.hide_logto_branding_oss_note"
          components={{
            a: (
              <TextLink
                href={officialWebsiteLink}
                targetBlank="noopener"
                className={styles.highlight}
              />
            ),
          }}
        />
      </div>
    </FormField>
  );
}

export default HideLogtoBrandingField;
