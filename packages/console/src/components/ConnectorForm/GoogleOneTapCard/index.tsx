import { type GoogleConnectorConfig } from '@logto/connector-kit';
import { Theme } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import Checkbox from '@/ds-components/Checkbox';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextLink from '@/ds-components/TextLink';
import useTheme from '@/hooks/use-theme';

import figureDark from './figure-dark.webp';
import figureLight from './figure-light.webp';
import * as styles from './index.module.scss';

type FormContext = { rawConfig: { oneTap: GoogleConnectorConfig['oneTap'] } };

const themeToFigure = Object.freeze({
  [Theme.Light]: figureLight,
  [Theme.Dark]: figureDark,
} satisfies Record<Theme, string>);

/**
 * A card for configuring Google One Tap. It requires the `rawConfig.oneTap` field in the form
 * context which can usually be obtained from the connector configuration context.
 */
function GoogleOneTapCard() {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.connector_details.google_one_tap',
  });
  const { register, control, watch } = useFormContext<FormContext>();
  const isEnabled = watch('rawConfig.oneTap.isEnabled');
  const theme = useTheme();

  return (
    <FormCard
      title="connector_details.google_one_tap.title"
      description="connector_details.google_one_tap.description"
    >
      <FormField title="connector_details.google_one_tap.enable_google_one_tap">
        <Switch
          description={
            <div className={styles.oneTapSwitch}>
              <img
                className={styles.figure}
                src={themeToFigure[theme]}
                alt="Google One Tap figure"
              />
              {t('enable_google_one_tap_description')}
            </div>
          }
          {...register('rawConfig.oneTap.isEnabled')}
        />
      </FormField>
      {isEnabled && (
        <FormField
          title="connector_details.google_one_tap.configure_google_one_tap"
          className={styles.oneTapConfig}
        >
          <Controller
            name="rawConfig.oneTap.autoSelect"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <Checkbox label={t('auto_select')} checked={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            defaultValue
            name="rawConfig.oneTap.closeOnTapOutside"
            control={control}
            render={({ field }) => (
              <Checkbox
                label={t('close_on_tap_outside')}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            defaultValue
            name="rawConfig.oneTap.itpSupport"
            control={control}
            render={({ field }) => (
              <Checkbox
                label={
                  <Trans
                    components={{
                      a: (
                        <TextLink
                          href="https://developers.google.com/identity/gsi/web/guides/features#upgraded_ux_on_itp_browsers"
                          targetBlank="noopener"
                        />
                      ),
                    }}
                    i18nKey="admin_console.connector_details.google_one_tap.itp_support"
                  />
                }
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
      )}
    </FormCard>
  );
}

export default GoogleOneTapCard;
