import { type TFuncKey } from 'i18next';

import DynamicT from '@/ds-components/DynamicT';

import * as styles from './index.module.scss';

type Props = {
  readonly title: TFuncKey<'translation', 'admin_console.sign_in_exp'>;
};

function FormSectionTitle({ title }: Props) {
  return (
    <div className={styles.title}>
      <DynamicT forKey={`sign_in_exp.${title}`} />
    </div>
  );
}

export default FormSectionTitle;
