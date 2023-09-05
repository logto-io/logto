import PageMeta from '@/components/PageMeta';
import TabWrapper from '@/ds-components/TabWrapper';

import * as styles from '../index.module.scss';

import AuthenticationForm from './AuthenticationForm';
import LanguagesForm from './LanguagesForm';
import TermsForm from './TermsForm';

type Props = {
  isActive: boolean;
};

function Content({ isActive }: Props) {
  return (
    <TabWrapper isActive={isActive} className={styles.tabContent}>
      {isActive && <PageMeta titleKey={['sign_in_exp.tabs.content', 'sign_in_exp.page_title']} />}
      <TermsForm />
      <LanguagesForm isManageLanguageVisible />
      <AuthenticationForm />
    </TabWrapper>
  );
}

export default Content;
