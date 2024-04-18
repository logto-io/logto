import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import CaretDown from '@/assets/icons/caret-down.svg';
import CaretUp from '@/assets/icons/caret-up.svg';
import Error from '@/assets/icons/toast-error.svg';
import UnnamedTrans from '@/components/UnnamedTrans';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import Select from '@/ds-components/Select';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import type { ConnectorFormType } from '@/types/connector';
import { SyncProfileMode } from '@/types/connector';
import { uriValidator } from '@/utils/validator';

import * as styles from './index.module.scss';

type Props = {
  readonly isAllowEditTarget?: boolean;
  readonly isDarkDefaultVisible?: boolean;
  readonly isStandard?: boolean;
  readonly conflictConnectorName?: Record<string, string>;
};

function BasicForm({
  isAllowEditTarget,
  isDarkDefaultVisible,
  isStandard,
  conflictConnectorName,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ConnectorFormType>();
  const [darkVisible, setDarkVisible] = useState(Boolean(isDarkDefaultVisible));

  const toggleDarkVisible = () => {
    setDarkVisible((previous) => !previous);
  };

  const toggleVisibleButtonTitle = darkVisible
    ? 'connectors.guide.logo_dark_collapse'
    : 'connectors.guide.logo_dark_show';

  const ToggleVisibleCaretIcon = darkVisible ? CaretUp : CaretDown;

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
          <FormField title="connectors.guide.logo" tip={t('connectors.guide.logo_tip')}>
            <TextInput
              placeholder={t('connectors.guide.logo_placeholder')}
              error={errors.logo?.message}
              {...register('logo', {
                validate: (value) =>
                  !value || uriValidator(value) || t('errors.invalid_uri_format'),
              })}
            />
          </FormField>
          {darkVisible && (
            <FormField title="connectors.guide.logo_dark" tip={t('connectors.guide.logo_dark_tip')}>
              <TextInput
                placeholder={t('connectors.guide.logo_dark_placeholder')}
                error={errors.logoDark?.message}
                {...register('logoDark', {
                  validate: (value) =>
                    !value || uriValidator(value) || t('errors.invalid_uri_format'),
                })}
              />
            </FormField>
          )}
          <div className={styles.fieldButton}>
            <Button
              size="small"
              type="text"
              title={toggleVisibleButtonTitle}
              trailingIcon={<ToggleVisibleCaretIcon className={styles.trailingIcon} />}
              onClick={toggleDarkVisible}
            />
          </div>
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
