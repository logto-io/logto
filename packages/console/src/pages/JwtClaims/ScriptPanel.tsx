/* Code Editor for the custom JWT claims script. */
import Card from '@/ds-components/Card';

import MonacoCodeEditor, { type Model } from './MonacoCodeEditor';
import * as styles from './index.module.scss';

type Props = {
  title: string;
  activeModel: Model;
};

function ScriptPanel({ title, activeModel }: Props) {
  return (
    <Card className={styles.codePanel}>
      <div className={styles.cardTitle}>{title}</div>
      <MonacoCodeEditor className={styles.flexGrow} models={[activeModel]} />
    </Card>
  );
}

export default ScriptPanel;
