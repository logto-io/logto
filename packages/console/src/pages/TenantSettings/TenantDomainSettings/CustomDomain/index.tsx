import { type CustomDomain as CustomDomainType, DomainStatus } from '@logto/schemas';
import classNames from 'classnames';

import ActivationProcess from './ActivationProcess';
import CustomDomainHeader from './CustomDomainHeader';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  customDomain: CustomDomainType;
  hasExtraTipsOnDelete?: boolean;
  hasOpenExternalLink?: boolean;
  isReadonly?: boolean;
  onDeleteCustomDomain: () => Promise<void>;
};

function CustomDomain({
  className,
  customDomain,
  hasExtraTipsOnDelete,
  hasOpenExternalLink,
  isReadonly,
  onDeleteCustomDomain,
}: Props) {
  return (
    <div className={classNames(styles.container, className)}>
      <CustomDomainHeader
        customDomain={customDomain}
        hasExtraTipsOnDelete={hasExtraTipsOnDelete}
        hasOpenExternalLink={hasOpenExternalLink}
        isReadonly={isReadonly}
        onDeleteCustomDomain={onDeleteCustomDomain}
      />
      {customDomain.status !== DomainStatus.Active && (
        <ActivationProcess customDomain={customDomain} />
      )}
    </div>
  );
}

export default CustomDomain;
