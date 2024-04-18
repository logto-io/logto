import { type TestResultData } from '@/pages/CustomizeJwtDetails/MainContent/ScriptSection/use-test-handler';

import * as styles from './index.module.scss';

type Props = {
  readonly testResult: TestResultData;
};

function ErrorContent({ testResult }: Props) {
  return (
    <div>
      {testResult.error && (
        <pre className={styles.error}>
          {'Error: \n'}
          {testResult.error}
        </pre>
      )}
      {testResult.payload && (
        <pre>
          {'Extra JWT claims: \n'}
          {testResult.payload}
        </pre>
      )}
    </div>
  );
}

export default ErrorContent;
