import { type ConnectorFactoryResponse } from '@logto/schemas';
import classNames from 'classnames';

import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import { type ConnectorGroup } from '@/types/connector';

import ConnectorRadio from './ConnectorRadio';
import styles from './index.module.scss';

export type ConnectorRadioGroupSize = 'medium' | 'large' | 'xlarge';

type Props = {
  readonly name: string;
  readonly value?: string;
  readonly groups: Array<ConnectorGroup<ConnectorFactoryResponse>>;
  readonly size: ConnectorRadioGroupSize;
  readonly onChange: (groupId: string) => void;
};

function ConnectorRadioGroup({ name, groups, value, size, onChange }: Props) {
  return (
    <RadioGroup
      name={name}
      value={value}
      type="card"
      className={classNames(styles.connectorGroup, styles[size])}
      onChange={onChange}
    >
      {groups.map((data) => (
        <Radio key={data.id} value={data.id}>
          <ConnectorRadio data={data} />
        </Radio>
      ))}
    </RadioGroup>
  );
}

export default ConnectorRadioGroup;
