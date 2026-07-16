import { type TestResultData } from '../use-test-handler';

import styles from './index.module.scss';

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
          {'Hook result: \n'}
          {testResult.payload}
        </pre>
      )}
    </div>
  );
}

export default ErrorContent;
