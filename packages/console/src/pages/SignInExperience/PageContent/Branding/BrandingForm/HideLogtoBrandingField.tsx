import { useFormContext } from 'react-hook-form';
import { Trans } from 'react-i18next';

import { CloudTag } from '@/components/FeatureTag';
import { isDevFeaturesEnabled } from '@/consts/env';
import { latestProPlanId } from '@/consts/subscriptions';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextLink from '@/ds-components/TextLink';

import type { SignInExperienceForm } from '../../../types';

import styles from './index.module.scss';
import { getHideLogtoBrandingOssNote } from './utils';

type Props = {
  readonly variant: 'cloud' | 'oss';
  readonly isEnabledInCloud: boolean;
};

function HideLogtoBrandingField({ variant, isEnabledInCloud }: Props) {
  const { register } = useFormContext<SignInExperienceForm>();
  const ossNote = getHideLogtoBrandingOssNote({ isDevFeaturesEnabled });

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
          i18nKey={ossNote.i18nKey}
          components={{
            a: (
              <TextLink
                href={ossNote.cloudHref}
                targetBlank="noopener"
                className={styles.highlight}
              />
            ),
          }}
        />
        {ossNote.hasSelfHostedPlansOption && (
          <>
            {' · '}
            <TextLink
              href={ossNote.selfHostedHref}
              targetBlank="noopener"
              className={styles.highlight}
            >
              <DynamicT forKey="upsell.explore_self_hosted_plans" />
            </TextLink>
          </>
        )}
      </div>
    </FormField>
  );
}

export default HideLogtoBrandingField;
