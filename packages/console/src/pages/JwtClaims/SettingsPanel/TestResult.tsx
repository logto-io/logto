import { useTranslation } from 'react-i18next';

import CloseIcon from '@/assets/icons/close.svg';
import IconButton from '@/ds-components/IconButton';

import * as styles from './index.module.scss';

export type TestResultData = {
  error?: string;
  payload?: string;
};

type Props = {
  testResult: TestResultData;
  onClose: () => void;
};

function TestResult({ testResult, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.jwt_claims' });

  return (
    <div className={styles.testResult}>
      <div className={styles.testResultHeader}>
        <span>{t('tester.result_title')}</span>
        <IconButton className={styles.closeIcon} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className={styles.testResultContent}>
        {testResult.error && (
          <pre className={styles.error}>
            {'Error: \n'}
            {testResult.error}
          </pre>
        )}
        {testResult.payload && (
          <pre>
            {'JWT Payload: \n'}
            {testResult.payload}
          </pre>
        )}
      </div>
    </div>
  );
}

export default TestResult;
