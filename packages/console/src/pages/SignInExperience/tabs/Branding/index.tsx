import TabWrapper from '../../components/TabWrapper';
import * as styles from '../index.module.scss';
import BrandingForm from './BrandingForm';
import ColorForm from './ColorForm';

type Props = {
  isActive: boolean;
};

const Branding = ({ isActive }: Props) => (
  <TabWrapper isActive={isActive} className={styles.tabContent}>
    <ColorForm />
    <BrandingForm />
  </TabWrapper>
);

export default Branding;
