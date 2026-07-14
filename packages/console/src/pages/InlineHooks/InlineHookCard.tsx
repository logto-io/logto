import Lightening from '@/assets/icons/lightening.svg?react';
import DynamicT from '@/ds-components/DynamicT';
import Tag from '@/ds-components/Tag';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import { type InlineHookCatalogItem } from './constants';
import styles from './index.module.scss';
import { type InlineHookConfig, InlineHookAction } from './types';
import { getInlineHookPagePath } from './utils';

type Props = InlineHookCatalogItem & {
  readonly config?: InlineHookConfig;
};

function InlineHookCard({ hookType, name, description, config }: Props) {
  const { navigate } = useTenantPathname();
  const isConfigured = Boolean(config);
  const isEnabled = config?.value.enabled === true;

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => {
        navigate(
          getInlineHookPagePath(
            hookType,
            isConfigured ? InlineHookAction.Edit : InlineHookAction.Create
          )
        );
      }}
    >
      <div className={styles.iconContainer}>
        <Lightening className={styles.icon} />
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
                  <DynamicT forKey="inline_hooks.status.configured" />
                </Tag>
                <Tag
                  type="state"
                  status={isEnabled ? 'success' : 'info'}
                  variant="plain"
                  size="small"
                >
                  <DynamicT
                    forKey={
                      isEnabled ? 'inline_hooks.status.enabled' : 'inline_hooks.status.disabled'
                    }
                  />
                </Tag>
              </>
            ) : (
              <Tag type="state" status="info" variant="plain" size="small">
                <DynamicT forKey="inline_hooks.status.not_configured" />
              </Tag>
            )}
          </div>
        </div>
        <div className={styles.description}>
          <DynamicT forKey={description} />
        </div>
      </div>
    </button>
  );
}

export default InlineHookCard;
