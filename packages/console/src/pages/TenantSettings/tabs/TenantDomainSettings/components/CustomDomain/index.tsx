import { type Domain } from '@logto/schemas';

import CustomDomainHeader from './components/CustomDomainHeader';
import * as styles from './index.module.scss';

type Props = {
  customDomain: Domain;
  onDeleteCustomDomain: () => void;
};

function CustomDomain({ customDomain, onDeleteCustomDomain }: Props) {
  return (
    <div className={styles.container}>
      <CustomDomainHeader customDomain={customDomain} onDeleteCustomDomain={onDeleteCustomDomain} />
      {/* TODO @xiaoyijun add custom domain active process content */}
    </div>
  );
}

export default CustomDomain;
