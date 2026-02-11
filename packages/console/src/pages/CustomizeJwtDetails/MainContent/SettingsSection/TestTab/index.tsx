import { LogtoJwtTokenKeyType } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext, type ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { isDevFeaturesEnabled } from '@/consts/env';
import MonacoCodeEditor, {
  type ModelControl,
} from '@/pages/CustomizeJwtDetails/MainContent/MonacoCodeEditor';
import { type JwtCustomizerForm } from '@/pages/CustomizeJwtDetails/type';
import {
  accessTokenPayloadTestModel,
  clientCredentialsPayloadTestModel,
  m2mContextTestModel,
  userContextTestModel,
} from '@/pages/CustomizeJwtDetails/utils/config';

import tabContentStyles from '../index.module.scss';

import styles from './index.module.scss';

type Props = {
  readonly isActive: boolean;
};

const accessTokenModelSettings = [accessTokenPayloadTestModel, userContextTestModel];
// DEV: application context in JWT customizer
const clientCredentialsModelSettings = isDevFeaturesEnabled
  ? [clientCredentialsPayloadTestModel, m2mContextTestModel]
  : [clientCredentialsPayloadTestModel];

function TestTab({ isActive }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.jwt_claims' });
  const [activeModelName, setActiveModelName] = useState<string>();

  const { watch, control, formState } = useFormContext<JwtCustomizerForm>();
  const tokenType = watch('tokenType');

  const editorModels = useMemo(
    () =>
      tokenType === LogtoJwtTokenKeyType.AccessToken
        ? accessTokenModelSettings
        : clientCredentialsModelSettings,
    [tokenType]
  );

  useEffect(() => {
    setActiveModelName(editorModels[0]?.name);
  }, [editorModels, tokenType]);

  const getModelControllerProps = useCallback(
    ({ value, onChange }: ControllerRenderProps<JwtCustomizerForm, 'testSample'>): ModelControl => {
      const isContextModel =
        activeModelName === userContextTestModel.name ||
        activeModelName === m2mContextTestModel.name;

      return {
        value: isContextModel ? value.contextSample : value.tokenSample,
        onChange: (newValue: string | undefined) => {
          // Form value is a object we need to update the specific field
          const updatedValue: JwtCustomizerForm['testSample'] = {
            ...value,
            ...(isContextModel ? { contextSample: newValue } : { tokenSample: newValue }),
          };

          onChange(updatedValue);
        },
      };
    },
    [activeModelName]
  );

  const validateSampleCode = useCallback(
    (value: JwtCustomizerForm['testSample']) => {
      for (const [_, sampleCode] of Object.entries(value)) {
        if (sampleCode) {
          try {
            JSON.parse(sampleCode);
          } catch {
            return t('form_error.invalid_json');
          }
        }
      }

      return true;
    },
    [t]
  );

  return (
    <div className={classNames(tabContentStyles.tabContent, isActive && tabContentStyles.active)}>
      <div className={tabContentStyles.description}>{t('tester.subtitle')}</div>
      <div className={classNames(tabContentStyles.flexColumn, tabContentStyles.flexGrow)}>
        <Controller
          control={control}
          name="testSample"
          rules={{
            validate: validateSampleCode,
          }}
          render={({ field }) => (
            <MonacoCodeEditor
              className={styles.codeEditor}
              enabledActions={['restore', 'copy']}
              models={editorModels}
              activeModelName={activeModelName}
              setActiveModel={setActiveModelName}
              // Pass the value and onChange handler based on the active model
              {...getModelControllerProps(field)}
            />
          )}
        />
        {formState.errors.testSample && (
          <div className={styles.error}>{formState.errors.testSample.message}</div>
        )}
      </div>
    </div>
  );
}

export default TestTab;
