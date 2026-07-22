import { type MouseEventHandler } from 'react';

import Code from '@/assets/icons/code.svg?react';
import DeleteIcon from '@/assets/icons/delete.svg?react';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import Tag from '@/ds-components/Tag';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { onKeyDownHandler } from '@/utils/a11y';

import { type ActionCatalogItem } from './constants';
import styles from './index.module.scss';
import { type ActionConfig, ActionPageMode } from './types';
import { getActionPagePath } from './utils';

type Props = ActionCatalogItem & {
  readonly config?: ActionConfig;
  readonly onDelete?: () => void;
};

function ActionCard({ actionType, name, description, config, onDelete }: Props) {
  const { navigate } = useTenantPathname();
  const isConfigured = Boolean(config);
  const isEnabled = config?.value.enabled === true;

  const goToDetail = () => {
    navigate(
      getActionPagePath(actionType, isConfigured ? ActionPageMode.Edit : ActionPageMode.Create)
    );
  };

  const handleDeleteClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.card}
      onClick={goToDetail}
      onKeyDown={(event) => {
        // Nested controls (e.g. Delete) also bubble Space/Enter; only activate the
        // card when it is the event target so child buttons keep their own keys.
        if (event.target !== event.currentTarget) {
          return;
        }

        onKeyDownHandler(goToDetail)(event);
      }}
    >
      <div className={styles.iconContainer}>
        <Code className={styles.icon} />
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.name}>
            <DynamicT forKey={name} />
          </div>
          <div className={styles.tags}>
            {isConfigured ? (
              <>
                <Tag type="state" status="success" variant="plain" size="small">
                  <DynamicT forKey="actions.status.configured" />
                </Tag>
                <Tag
                  type="state"
                  status={isEnabled ? 'success' : 'info'}
                  variant="plain"
                  size="small"
                >
                  <DynamicT
                    forKey={isEnabled ? 'actions.status.enabled' : 'actions.status.disabled'}
                  />
                </Tag>
              </>
            ) : (
              <Tag type="state" status="info" variant="plain" size="small">
                <DynamicT forKey="actions.status.not_configured" />
              </Tag>
            )}
          </div>
        </div>
        <div className={styles.description}>
          <DynamicT forKey={description} />
        </div>
        {isConfigured && onDelete && (
          <div className={styles.actions}>
            <Button
              className={styles.danger}
              icon={<DeleteIcon className={styles.actionIcon} />}
              type="text"
              size="small"
              title="general.delete"
              onClick={handleDeleteClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ActionCard;
