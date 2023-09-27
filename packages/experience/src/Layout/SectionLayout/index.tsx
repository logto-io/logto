import { type TFuncKey } from 'i18next';
import { type ReactNode } from 'react';

import DynamicT from '@/components/DynamicT';

import * as styles from './index.module.scss';

type Props = {
  title: TFuncKey;
  description: TFuncKey;
  titleProps?: Record<string, unknown>;
  descriptionProps?: Record<string, unknown>;
  children: ReactNode;
};

const SectionLayout = ({ title, description, titleProps, descriptionProps, children }: Props) => {
  return (
    <div>
      <div className={styles.title}>
        <DynamicT forKey={title} interpolation={titleProps} />
      </div>
      <div className={styles.description}>
        <DynamicT forKey={description} interpolation={descriptionProps} />
      </div>
      {children}
    </div>
  );
};

export default SectionLayout;
