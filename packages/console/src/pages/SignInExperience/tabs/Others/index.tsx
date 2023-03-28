import PageMeta from '@/components/PageMeta';

import TabWrapper from '../../components/TabWrapper';
import * as styles from '../index.module.scss';

import AuthenticationForm from './AuthenticationForm';
import LanguagesForm from './LanguagesForm';
import TermsForm from './TermsForm';

type Props = {
  isActive: boolean;
};

function Others({ isActive }: Props) {
  return (
    <TabWrapper isActive={isActive} className={styles.tabContent}>
      {isActive && <PageMeta titleKey={['sign_in_exp.tabs.others', 'sign_in_exp.page_title']} />}
      <TermsForm />
      <LanguagesForm isManageLanguageVisible />
      <AuthenticationForm />
    </TabWrapper>
  );
}

export default Others;
