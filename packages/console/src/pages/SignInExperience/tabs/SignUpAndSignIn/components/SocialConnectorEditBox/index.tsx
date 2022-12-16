import { ConnectorType } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import TextLink from '@/components/TextLink';
import DragDropProvider from '@/components/Transfer/DragDropProvider';
import DraggableItem from '@/components/Transfer/DraggableItem';
import { ConnectorsPage } from '@/consts/page-tabs';
import useConnectorGroups from '@/hooks/use-connector-groups';
import type { ConnectorGroup } from '@/types/connector';
import { getConnectorPathname } from '@/utilities/router';

import ConnectorSetupWarning from '../ConnectorSetupWarning';
import AddButton from './AddButton';
import SelectedConnectorItem from './SelectedConnectorItem';
import * as styles from './index.module.scss';

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
};

const SocialConnectorEditBox = ({ value, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: connectorData, error } = useConnectorGroups();

  if (!connectorData || error) {
    return null;
  }

  const onMoveItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = value[dragIndex];
    const hoverItem = value[hoverIndex];

    if (!dragItem || !hoverItem) {
      return;
    }

    onChange(
      value.map((value_, index) => {
        if (index === dragIndex) {
          return hoverItem;
        }

        if (index === hoverIndex) {
          return dragItem;
        }

        return value_;
      })
    );
  };

  const selectedConnectorItems = value
    .map((connectorTarget) => connectorData.find(({ target }) => target === connectorTarget))
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
    .filter((item): item is ConnectorGroup => Boolean(item));

  const connectorOptions = connectorData.filter(
    ({ target, type }) => !value.includes(target) && type === ConnectorType.Social
  );

  return (
    <div>
      <DragDropProvider>
        {selectedConnectorItems.map((item, index) => (
          <DraggableItem
            key={item.id}
            id={item.id}
            sortIndex={index}
            moveItem={onMoveItem}
            className={styles.draggleItemContainer}
          >
            <SelectedConnectorItem
              data={item}
              onDelete={(target) => {
                onChange(value.filter((connectorTarget) => connectorTarget !== target));
              }}
            />
          </DraggableItem>
        ))}
      </DragDropProvider>
      <AddButton
        options={connectorOptions}
        hasSelectedConnectors={selectedConnectorItems.length > 0}
        onSelected={(target) => {
          onChange([...value, target]);
        }}
      />
      <ConnectorSetupWarning requiredConnectors={[ConnectorType.Social]} />
      <div className={styles.setUpHint}>
        {t('sign_in_exp.sign_up_and_sign_in.social_sign_in.set_up_hint.not_in_list')}
        <TextLink
          to={getConnectorPathname(ConnectorsPage.SocialTab)}
          target="_blank"
          className={styles.setup}
        >
          {t('sign_in_exp.sign_up_and_sign_in.social_sign_in.set_up_hint.set_up_more')}
        </TextLink>
        {t('sign_in_exp.sign_up_and_sign_in.social_sign_in.set_up_hint.go_to')}
      </div>
    </div>
  );
};

export default SocialConnectorEditBox;
