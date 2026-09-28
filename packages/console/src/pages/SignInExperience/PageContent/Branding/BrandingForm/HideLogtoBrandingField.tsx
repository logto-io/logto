import { useFormContext } from 'react-hook-form';
import { Trans } from 'react-i18next';

import { CloudTag } from '@/components/FeatureTag';
import { latestProPlanId } from '@/consts/subscriptions';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextLink from '@/ds-components/TextLink';

import type { SignInExperienceForm } from '../../../types';

import styles from './index.module.scss';
import { getHideLogtoBrandingOssNote } from './utils';

type Props = {
  /**
   * `switch` when hiding the branding is available: on Cloud, or on a self-hosted deployment whose
   * license grants it. `oss-upsell` otherwise, which shows a locked switch and the upsell note.
   */
  readonly variant: 'switch' | 'oss-upsell';
  /** Whether the switch can be turned on. Only read by the `switch` variant. */
  readonly isEnabled: boolean;
};

function HideLogtoBrandingField({ variant, isEnabled }: Props) {
  const { register } = useFormContext<SignInExperienceForm>();
  const ossNote = getHideLogtoBrandingOssNote();

  if (variant === 'switch') {
    return (
      <FormField
        title="sign_in_exp.branding.hide_logto_branding"
        featureTag={{
          isVisible: !isEnabled,
          plan: latestProPlanId,
        }}
      >
        <Switch
          description="sign_in_exp.branding.hide_logto_branding_description"
          {...register('hideLogtoBranding')}
          disabled={!isEnabled}
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
              {...(ossNote.selfHostedTargetBlank
                ? { href: ossNote.selfHostedHref }
                : { to: ossNote.selfHostedHref })}
              targetBlank={ossNote.selfHostedTargetBlank}
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
