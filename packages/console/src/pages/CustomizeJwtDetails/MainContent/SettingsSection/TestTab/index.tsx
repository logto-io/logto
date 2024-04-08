import { LogtoJwtTokenKeyType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext, type ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import MonacoCodeEditor, {
  type ModelControl,
} from '@/pages/CustomizeJwtDetails/MainContent/MonacoCodeEditor';
import { type JwtCustomizerForm } from '@/pages/CustomizeJwtDetails/type';
import {
  accessTokenPayloadTestModel,
  clientCredentialsPayloadTestModel,
  userContextTestModel,
} from '@/pages/CustomizeJwtDetails/utils/config';

import * as tabContentStyles from '../index.module.scss';

import * as styles from './index.module.scss';

type Props = {
  isActive: boolean;
};

const accessTokenModelSettings = [accessTokenPayloadTestModel, userContextTestModel];
const clientCredentialsModelSettings = [clientCredentialsPayloadTestModel];

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
      return {
        value:
          activeModelName === userContextTestModel.name ? value.contextSample : value.tokenSample,
        onChange: (newValue: string | undefined) => {
          // Form value is a object we need to update the specific field
          const updatedValue: JwtCustomizerForm['testSample'] = {
            ...value,
            ...conditional(
              activeModelName === userContextTestModel.name && {
                contextSample: newValue,
              }
            ),
            ...conditional(
              activeModelName === accessTokenPayloadTestModel.name && {
                tokenSample: newValue,
              }
            ),
            ...conditional(
              activeModelName === clientCredentialsPayloadTestModel.name && {
                // Reset the field to undefined if the value is the same as the default value
                tokenSample: newValue,
              }
            ),
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
