import TabWrapper from '../../components/TabWrapper';
import * as styles from '../index.module.scss';
import AuthenticationForm from './AuthenticationForm';
import LanguagesForm from './LanguagesForm';
import TermsForm from './TermsForm';

type Props = {
  isActive: boolean;
};

const Others = ({ isActive }: Props) => (
  <TabWrapper isActive={isActive} className={styles.tabContent}>
    <TermsForm />
    <LanguagesForm isManageLanguageVisible />
    <AuthenticationForm />
  </TabWrapper>
);

export default Others;
