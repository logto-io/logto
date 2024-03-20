import { LogtoJwtTokenPath } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext, Controller, type ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';

import MonacoCodeEditor, { type ModelControl } from '../MonacoCodeEditor/index.js';
import { type JwtClaimsFormType } from '../type.js';
import {
  accessTokenPayloadTestModel,
  clientCredentialsPayloadTestModel,
  userContextTestModel,
} from '../utils/config.js';

import TestResult, { type TestResultData } from './TestResult.js';
import * as styles from './index.module.scss';

type Props = {
  isActive: boolean;
};

const userTokenModelSettings = [accessTokenPayloadTestModel, userContextTestModel];
const machineToMachineTokenModelSettings = [clientCredentialsPayloadTestModel];

function TestTab({ isActive }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.jwt_claims' });
  const [testResult, setTestResult] = useState<TestResultData>();
  const [activeModelName, setActiveModelName] = useState<string>();

  const { watch, control, formState } = useFormContext<JwtClaimsFormType>();
  const tokenType = watch('tokenType');

  const editorModels = useMemo(
    () =>
      tokenType === LogtoJwtTokenPath.AccessToken
        ? userTokenModelSettings
        : machineToMachineTokenModelSettings,
    [tokenType]
  );

  useEffect(() => {
    setActiveModelName(editorModels[0]?.name);
  }, [editorModels, tokenType]);

  const onTestHandler = useCallback(() => {
    // TODO: API integration, read form data and send the request to the server
  }, []);

  const getModelControllerProps = useCallback(
    ({ value, onChange }: ControllerRenderProps<JwtClaimsFormType, 'testSample'>): ModelControl => {
      // User access token context test model (user data)
      if (activeModelName === userContextTestModel.name) {
        return {
          value: value?.contextSample,
          onChange: (newValue: string | undefined) => {
            onChange({
              ...value,
              contextSample: newValue,
            });
          },
        };
      }

      // Token payload test model (user and machine to machine)
      return {
        value: value?.tokenSample,
        onChange: (newValue: string | undefined) => {
          onChange({
            ...value,
            tokenSample: newValue,
          });
        },
      };
    },
    [activeModelName]
  );

  const validateSampleCode = useCallback(
    (value: JwtClaimsFormType['testSample']) => {
      if (!value) {
        return true;
      }

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
    <div className={classNames(styles.tabContent, isActive && styles.active)}>
      <Card className={classNames(styles.card, styles.flexGrow, styles.flexColumn)}>
        <div className={styles.headerRow}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>{t('tester.title')}</div>
            <div className={styles.cardSubtitle}>{t('tester.subtitle')}</div>
          </div>
          <Button title="jwt_claims.tester.run_button" type="primary" onClick={onTestHandler} />
        </div>
        <div className={classNames(styles.cardContent, styles.flexColumn, styles.flexGrow)}>
          {formState.errors.testSample && (
            <div className={styles.error}>{formState.errors.testSample.message}</div>
          )}
          <Controller
            // Force rerender the controller when the token type changes
            // Otherwise the input field will not be updated
            key={tokenType}
            control={control}
            name="testSample"
            rules={{
              validate: validateSampleCode,
            }}
            render={({ field }) => (
              <MonacoCodeEditor
                className={styles.flexGrow}
                enabledActions={['restore', 'copy']}
                models={editorModels}
                activeModelName={activeModelName}
                setActiveModel={setActiveModelName}
                // Pass the value and onChange handler based on the active model
                {...getModelControllerProps(field)}
              />
            )}
          />
          {testResult && (
            <TestResult
              testResult={testResult}
              onClose={() => {
                setTestResult(undefined);
              }}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

export default TestTab;
