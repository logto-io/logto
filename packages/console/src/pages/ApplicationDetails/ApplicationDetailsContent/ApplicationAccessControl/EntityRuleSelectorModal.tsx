import { type AdminConsoleKey } from '@logto/phrases';
import { type ReactNode, useEffect, useState } from 'react';

import EntitiesTransfer from '@/components/EntitiesTransfer';
import ConfirmModal from '@/ds-components/ConfirmModal';
import FormField from '@/ds-components/FormField';
import { type Identifiable } from '@/types/general';

type Props<TEntity extends Identifiable> = {
  readonly isOpen: boolean;
  readonly title: AdminConsoleKey;
  readonly subtitle: AdminConsoleKey;
  readonly fieldTitle: AdminConsoleKey;
  readonly selectedEntities: TEntity[];
  readonly searchProps: {
    pathname: string;
    parameters?: Record<string, string>;
  };
  readonly emptyPlaceholder: AdminConsoleKey;
  readonly isLoading: boolean;
  readonly renderEntity: (entity: TEntity) => ReactNode;
  readonly onClose: () => void;
  readonly onSubmit: (entities: TEntity[]) => Promise<void>;
};

function EntityRuleSelectorModal<TEntity extends Identifiable>({
  isOpen,
  title,
  subtitle,
  fieldTitle,
  selectedEntities,
  searchProps,
  emptyPlaceholder,
  isLoading,
  renderEntity,
  onClose,
  onSubmit,
}: Props<TEntity>) {
  const [draftEntities, setDraftEntities] = useState(selectedEntities);

  useEffect(() => {
    if (isOpen) {
      setDraftEntities(selectedEntities);
    }
  }, [isOpen, selectedEntities]);

  return (
    <ConfirmModal
      isOpen={isOpen}
      isLoading={isLoading}
      title={title}
      subtitle={subtitle}
      confirmButtonType="primary"
      confirmButtonText="general.save"
      cancelButtonText="general.cancel"
      size="large"
      onCancel={onClose}
      onConfirm={async () => {
        await onSubmit(draftEntities);
      }}
    >
      <FormField title={fieldTitle}>
        <EntitiesTransfer
          searchProps={searchProps}
          selectedEntities={draftEntities}
          emptyPlaceholder={emptyPlaceholder}
          renderEntity={renderEntity}
          onChange={setDraftEntities}
        />
      </FormField>
    </ConfirmModal>
  );
}

export default EntityRuleSelectorModal;
