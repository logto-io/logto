import { useTranslation } from 'react-i18next';

import transferLayout from '@/scss/transfer.module.scss';
import { type Identifiable } from '@/types/general';

import TargetEntityItem from '../TargetEntityItem';

import styles from './index.module.scss';

type Props<T> = {
  readonly renderEntity: (entity: T) => React.ReactNode;
  readonly selectedEntities: T[];
  readonly onChange: (value: T[]) => void;
};

function TargetEntitiesBox<T extends Identifiable>({
  renderEntity,
  selectedEntities,
  onChange,
}: Props<T>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={transferLayout.box}>
      <div className={transferLayout.boxTopBar}>
        <span className={styles.added}>
          {`${selectedEntities.length} `}
          {t('general.added')}
        </span>
      </div>
      <div className={transferLayout.boxContent}>
        {selectedEntities.map((entity) => (
          <TargetEntityItem
            key={entity.id}
            entity={entity}
            render={renderEntity}
            onDelete={() => {
              onChange(selectedEntities.filter(({ id }) => id !== entity.id));
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default TargetEntitiesBox;
