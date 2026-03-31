import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
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
          label={t('sign_in_exp.branding.hide_logto_branding_description')}
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
        label={t('sign_in_exp.branding.hide_logto_branding_description')}
        {...register('hideLogtoBranding')}
        disabled
      />
      <div className={styles.ossNote}>
        This feature is natively available in{' '}
        <TextLink href={officialWebsiteLink} targetBlank="noopener" className={styles.highlight}>
          Logto Cloud
        </TextLink>
        .
      </div>
    </FormField>
  );
}

export default HideLogtoBrandingField;
