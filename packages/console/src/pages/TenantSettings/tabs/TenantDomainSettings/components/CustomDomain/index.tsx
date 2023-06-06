import { type Domain, DomainStatus } from '@logto/schemas';

import ActiveProcess from './components/ActiveProcess';
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
      {customDomain.status !== DomainStatus.Active && <ActiveProcess customDomain={customDomain} />}
    </div>
  );
}

export default CustomDomain;
