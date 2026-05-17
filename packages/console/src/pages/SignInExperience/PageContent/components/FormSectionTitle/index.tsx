import { type TFuncKey } from 'i18next';

import FeatureTag, { type Props as FeatureTagProps } from '@/components/FeatureTag';
import DynamicT from '@/ds-components/DynamicT';

import styles from './index.module.scss';

type Props = {
  readonly title: TFuncKey<'translation', 'admin_console.sign_in_exp'>;
  readonly featureTag?: FeatureTagProps;
};

function FormSectionTitle({ title, featureTag }: Props) {
  return (
    <div className={styles.title}>
      <DynamicT forKey={`sign_in_exp.${title}`} />
      {featureTag && <FeatureTag {...featureTag} />}
    </div>
  );
}

export default FormSectionTitle;
