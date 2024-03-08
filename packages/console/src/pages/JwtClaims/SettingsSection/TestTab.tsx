import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';

import MonacoCodeEditor from '../MonacoCodeEditor/index.js';
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

function TestTab({ isActive }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.jwt_claims' });
  const [testResult, setTestResult] = useState<TestResultData>();

  const { watch } = useFormContext<JwtClaimsFormType>();
  const tokenType = watch('tokenType');

  const editorModels = useMemo(
    () =>
      tokenType === JwtTokenType.UserAccessToken
        ? [userTokenPayloadTestModel, userTokenContextTestModel]
        : [machineToMachineTokenPayloadTestModel],
    [tokenType]
  );

  const onTestHandler = useCallback(() => {
    // TODO: API integration, read form data and send the request to the server
  }, []);

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
          <MonacoCodeEditor models={editorModels} className={styles.flexGrow} />
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
