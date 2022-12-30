import type { ConnectorFactoryResponse } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import CaretDown from '@/assets/images/caret-down.svg';
import CaretUp from '@/assets/images/caret-up.svg';
import Button from '@/components/Button';
import CodeEditor from '@/components/CodeEditor';
import FormField from '@/components/FormField';
import Select from '@/components/Select';
import TextInput from '@/components/TextInput';
import TextLink from '@/components/TextLink';
import { uriValidator, jsonValidator } from '@/utilities/validator';

import type { ConnectorFormType } from '../../types';
import { SyncProfileMode } from '../../types';
import * as styles from './index.module.scss';

type Props = {
  connectorType: ConnectorType;
  isStandard: ConnectorFactoryResponse['isStandard'];
  configTemplate?: ConnectorFactoryResponse['configTemplate'];
  isAllowEditTarget?: boolean;
  isDarkDefaultVisible?: boolean;
};

const ConnectorForm = ({
  configTemplate,
  isStandard,
  isAllowEditTarget,
  isDarkDefaultVisible,
  connectorType,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ConnectorFormType>();
  const [darkVisible, setDarkVisible] = useState(Boolean(isDarkDefaultVisible));

  const toggleDarkVisible = () => {
    setDarkVisible((previous) => !previous);
  };

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
              placeholder={t('connectors.guide.name')}
              hasError={Boolean(errors.name)}
              {...register('name', { required: true })}
            />
          </FormField>
          <FormField title="connectors.guide.logo" tip={t('connectors.guide.logo_tip')}>
            <TextInput
              placeholder={t('connectors.guide.logo_placeholder')}
              hasError={Boolean(errors.logo)}
              errorMessage={errors.logo?.message}
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
                hasError={Boolean(errors.logoDark)}
                errorMessage={errors.logoDark?.message}
                {...register('logoDark', {
                  validate: (value) =>
                    !value || uriValidator(value) || t('errors.invalid_uri_format'),
                })}
              />
            </FormField>
          )}
          <Button
            size="small"
            type="text"
            title={
              darkVisible
                ? 'connectors.guide.logo_dark_collapse'
                : 'connectors.guide.logo_dark_show'
            }
            trailingIcon={darkVisible ? <CaretUp /> : <CaretDown />}
            onClick={toggleDarkVisible}
          />
          <FormField
            isRequired
            title="connectors.guide.target"
            tip={(closeTipHandler) => (
              <Trans
                components={{
                  a: (
                    <TextLink
                      href="https://docs.logto.io/docs/references/connectors/#target"
                      target="_blank"
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
              hasError={Boolean(errors.target)}
              disabled={!isAllowEditTarget}
              {...register('target', { required: true })}
            />
            <div className={styles.tip}>{t('connectors.guide.target_tip')}</div>
          </FormField>
        </>
      )}
      <FormField title="connectors.guide.config">
        <Controller
          name="config"
          control={control}
          defaultValue={configTemplate}
          rules={{
            validate: (value) => jsonValidator(value) || t('errors.invalid_json_format'),
          }}
          render={({ field: { onChange, value } }) => (
            <CodeEditor
              hasError={Boolean(errors.config)}
              errorMessage={errors.config?.message}
              language="json"
              value={value}
              onChange={onChange}
            />
          )}
        />
      </FormField>
      {connectorType === ConnectorType.Social && (
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
      )}
    </div>
  );
};

export default ConnectorForm;
