import { type ConnectorFactoryResponse } from '@logto/schemas';
import classNames from 'classnames';

import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import { type ConnectorGroup } from '@/types/connector';

import ConnectorRadio from './ConnectorRadio';
import * as styles from './index.module.scss';

export type ConnectorRadioGroupSize = 'medium' | 'large' | 'xlarge';

type Props = {
  name: string;
  value?: string;
  groups: Array<ConnectorGroup<ConnectorFactoryResponse>>;
  size: ConnectorRadioGroupSize;
  onChange: (groupId: string) => void;
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
