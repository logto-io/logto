import { Theme } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import Error from '@/assets/icons/toast-error.svg?react';
import ImageInputs from '@/components/ImageInputs';
import UnnamedTrans from '@/components/UnnamedTrans';
import FormField from '@/ds-components/FormField';
import Select from '@/ds-components/Select';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import type { ConnectorFormType } from '@/types/connector';
import { SyncProfileMode } from '@/types/connector';

import styles from './index.module.scss';

const themeToField = Object.freeze({
  [Theme.Light]: 'logo',
  [Theme.Dark]: 'logoDark',
} as const satisfies Record<Theme, string>);

type Props = {
  readonly isAllowEditTarget?: boolean;
  readonly isStandard?: boolean;
  readonly conflictConnectorName?: Record<string, string>;
};

function BasicForm({ isAllowEditTarget, isStandard, conflictConnectorName }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ConnectorFormType>();

  const syncProfileOptions = [
    {
      value: SyncProfileMode.OnlyAtRegister,
      title: t('connectors.guide.sync_profile_only_at_sign_up'),
    },
    {
      value: SyncProfileMode.EachSignIn,
      title: t('connectors.guide.sync_profile_each_sign_in'),
    },
  ];

  return (
    <div>
      {isStandard && (
        <>
          <FormField isRequired title="connectors.guide.name" tip={t('connectors.guide.name_tip')}>
            <TextInput
              placeholder={t('connectors.guide.name_placeholder')}
              error={Boolean(errors.name)}
              {...register('name', { required: true })}
            />
          </FormField>
          <ImageInputs
            uploadTitle="connectors.guide.connector_logo"
            tip={t('connectors.guide.connector_logo_tip')}
            control={control}
            register={register}
            fields={Object.values(Theme).map((theme) => ({
              name: themeToField[theme],
              error: errors[themeToField[theme]],
              type: 'connector_logo',
              theme,
            }))}
          />
        </>
      )}
      <FormField
        isRequired={isStandard}
        title="connectors.guide.target"
        tip={(closeTipHandler) => (
          <Trans
            components={{
              a: (
                <TextLink
                  href={getDocumentationUrl('/docs/references/connectors/#target')}
                  targetBlank="noopener"
                  onClick={closeTipHandler}
                />
              ),
            }}
          >
            {t('connectors.guide.target_tooltip')}
          </Trans>
        )}
      >
        <TextInput
          placeholder={t('connectors.guide.target_placeholder')}
          error={Boolean(errors.target)}
          disabled={!isAllowEditTarget}
          {...register('target', { required: true })}
        />
        <div className={styles.tip}>
          {isStandard
            ? t('connectors.guide.target_tip_standard')
            : t('connectors.guide.target_tip')}
        </div>
        {conflictConnectorName && (
          <div className={styles.error}>
            <div className={styles.icon}>
              <Error />
            </div>
            <div className={styles.content}>
              <Trans
                components={{
                  span: <UnnamedTrans resource={conflictConnectorName} />,
                }}
              >
                {t('connectors.guide.target_conflict')}
              </Trans>
              {isStandard ? (
                <ul>
                  <li>
                    <Trans
                      components={{
                        span: <UnnamedTrans resource={conflictConnectorName} />,
                      }}
                    >
                      {t('connectors.guide.target_conflict_line2')}
                    </Trans>
                  </li>
                  <li>{t('connectors.guide.target_conflict_line3')}</li>
                </ul>
              ) : (
                <Trans
                  components={{
                    span: <UnnamedTrans resource={conflictConnectorName} />,
                  }}
                >
                  <br />
                  {t('connectors.guide.target_conflict_line2')}
                </Trans>
              )}
            </div>
          </div>
        )}
      </FormField>
      <FormField title="connectors.guide.sync_profile">
        <Controller
          name="syncProfile"
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Select options={syncProfileOptions} value={value} onChange={onChange} />
          )}
        />
        <div className={styles.tip}>{t('connectors.guide.sync_profile_tip')}</div>
      </FormField>
    </div>
  );
}

export default BasicForm;
