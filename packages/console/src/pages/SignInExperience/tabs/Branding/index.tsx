import TabWrapper from '../../components/TabWrapper';
import * as styles from '../index.module.scss';
import BrandingForm from './BrandingForm';
import ColorForm from './ColorForm';
import CustomCssForm from './CustomCssForm';

type Props = {
  isActive: boolean;
};

const Branding = ({ isActive }: Props) => (
  <TabWrapper isActive={isActive} className={styles.tabContent}>
    <ColorForm />
    <BrandingForm />
    <CustomCssForm />
  </TabWrapper>
);

export default Branding;
