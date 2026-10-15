import { type SsoConnectorProviderDetail } from '@logto/schemas';
import classNames from 'classnames';

import { type ConnectorRadioGroupSize } from '@/components/CreateConnectorForm/ConnectorRadioGroup';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';

import SsoConnectorRadio from './SsoConnectorRadio';
import styles from './index.module.scss';

type Props = {
  readonly name: string;
  readonly value?: string;
  readonly className?: string;
  readonly size: ConnectorRadioGroupSize;
  readonly connectors: SsoConnectorProviderDetail[];
  readonly isProviderDisabled?: (providerName: string) => boolean;
  readonly onChange: (providerName: string) => void;
};

function SsoConnectorRadioGroup({
  name,
  value,
  className,
  size,
  connectors,
  isProviderDisabled,
  onChange,
}: Props) {
  return (
    <RadioGroup
      name={name}
      value={value}
      type="card"
      className={classNames(className, styles.ssoConnectorGroup, styles[size])}
      onChange={onChange}
    >
      {connectors.map((data) => (
        <Radio
          key={data.providerName}
          value={data.providerName}
          isDisabled={isProviderDisabled?.(data.providerName)}
        >
          <SsoConnectorRadio data={data} />
        </Radio>
      ))}
    </RadioGroup>
  );
}

export default SsoConnectorRadioGroup;
