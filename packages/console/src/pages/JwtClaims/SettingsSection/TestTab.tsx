import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext, Controller, type ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';

import MonacoCodeEditor, { type ModelControl } from '../MonacoCodeEditor/index.js';
import {
  userTokenPayloadTestModel,
  machineToMachineTokenPayloadTestModel,
  userTokenContextTestModel,
  JwtTokenType,
} from '../config.js';
import { type JwtClaimsFormType } from '../type.js';

import TestResult, { type TestResultData } from './TestResult.js';
import * as styles from './index.module.scss';

type Props = {
  isActive: boolean;
};

const userTokenModelSettings = [userTokenPayloadTestModel, userTokenContextTestModel];
const machineToMachineTokenModelSettings = [machineToMachineTokenPayloadTestModel];

function TestTab({ isActive }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.jwt_claims' });
  const [testResult, setTestResult] = useState<TestResultData>();
  const [activeModelName, setActiveModelName] = useState<string>();

  const { watch, control } = useFormContext<JwtClaimsFormType>();
  const tokenType = watch('tokenType');

  const editorModels = useMemo(
    () =>
      tokenType === JwtTokenType.UserAccessToken
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
      if (activeModelName === userTokenContextTestModel.name) {
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
          <Controller
            // Force rerender the controller when the token type changes
            // Otherwise the input field will not be updated
            key={tokenType}
            shouldUnregister
            control={control}
            name="testSample"
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
