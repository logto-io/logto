import TabWrapper, { type Props as TabWrapperProps } from '@/ds-components/TabWrapper';

import * as styles from './index.module.scss';

type Props = Omit<TabWrapperProps, 'className'>;

function SignInExperienceTabWrapper({ children, ...reset }: Props) {
  return (
    <TabWrapper {...reset} className={styles.tabContent}>
      {children}
    </TabWrapper>
  );
}

export default SignInExperienceTabWrapper;
