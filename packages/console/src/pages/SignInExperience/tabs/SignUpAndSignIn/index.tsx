import PageMeta from '@/components/PageMeta';
import TabWrapper from '@/ds-components/TabWrapper';

import * as styles from '../index.module.scss';

import AdvancedOptions from './AdvancedOptions';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import SocialSignInForm from './SocialSignInForm';

type Props = {
  isActive: boolean;
};

function SignUpAndSignIn({ isActive }: Props) {
  return (
    <TabWrapper isActive={isActive} className={styles.tabContent}>
      {isActive && (
        <PageMeta titleKey={['sign_in_exp.tabs.sign_up_and_sign_in', 'sign_in_exp.page_title']} />
      )}
      <SignUpForm />
      <SignInForm />
      <SocialSignInForm />
      <AdvancedOptions />
    </TabWrapper>
  );
}

export default SignUpAndSignIn;
