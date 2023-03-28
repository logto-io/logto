import PageMeta from '@/components/PageMeta';

import TabWrapper from '../../components/TabWrapper';
import * as styles from '../index.module.scss';

import BrandingForm from './BrandingForm';
import CustomCssForm from './CustomCssForm';

type Props = {
  isActive: boolean;
};

function Branding({ isActive }: Props) {
  return (
    <TabWrapper isActive={isActive} className={styles.tabContent}>
      {isActive && <PageMeta titleKey={['sign_in_exp.tabs.branding', 'sign_in_exp.page_title']} />}
      <BrandingForm />
      <CustomCssForm />
    </TabWrapper>
  );
}

export default Branding;
