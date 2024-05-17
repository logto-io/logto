import { ConnectorType } from '@logto/schemas';

import ConnectorLogo from '@/components/ConnectorLogo';
import UnnamedTrans from '@/components/UnnamedTrans';
import DangerousRaw from '@/ds-components/DangerousRaw';
import useConnectorGroups from '@/hooks/use-connector-groups';
import { MultiCardSelector } from '@/onboarding/components/CardSelector';
import type { MultiCardSelectorOption } from '@/onboarding/components/CardSelector';

import { fakeSocialTargetOptions } from '../options';

type Props = {
  readonly value: string[];
  readonly onChange: (value: string[]) => void;
};

function SocialSelector({ value, onChange }: Props) {
  const { data: connectorData, error } = useConnectorGroups();

  if (!connectorData || error) {
    return null;
  }

  const connectorOptions: MultiCardSelectorOption[] = connectorData
    .filter(({ type }) => type === ConnectorType.Social)
    .map((item) => {
      return {
        icon: <ConnectorLogo size="small" data={item} />,
        title: (
          <DangerousRaw>
            <UnnamedTrans resource={item.name} />
          </DangerousRaw>
        ),
        value: item.target,
        tag: 'general.demo',
      };
    });

  return (
    <MultiCardSelector
      options={[...connectorOptions, ...fakeSocialTargetOptions]}
      value={value}
      onChange={onChange}
    />
  );
}

export default SocialSelector;
