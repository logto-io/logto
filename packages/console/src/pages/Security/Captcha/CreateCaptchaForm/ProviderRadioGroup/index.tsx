import { CaptchaType } from '@logto/schemas';
import { z } from 'zod';

import RadioGroup, { Radio } from '@/ds-components/RadioGroup';

import useDataFetch from '../../use-data-fetch';
import { captchaProviders } from '../constants';

import ProviderRadio from './ProviderRadio';
import styles from './index.module.scss';

type Props = {
  readonly value?: CaptchaType;
  readonly onChange: (type: CaptchaType) => void;
};

function ProviderRadioGroup({ value, onChange }: Props) {
  const { data } = useDataFetch();

  return (
    <RadioGroup
      name="provider"
      value={value}
      type="card"
      className={styles.group}
      onChange={(value) => {
        const selected = z.nativeEnum(CaptchaType).parse(value);
        onChange(selected);
      }}
    >
      {captchaProviders
        .filter((provider) => provider.type !== data?.config.type)
        .map((provider) => (
          <Radio key={provider.type} value={provider.type}>
            <ProviderRadio data={provider} />
          </Radio>
        ))}
    </RadioGroup>
  );
}

export default ProviderRadioGroup;
