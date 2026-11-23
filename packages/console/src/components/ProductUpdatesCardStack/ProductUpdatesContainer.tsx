import { usePostHog } from 'posthog-js/react';
import { useCallback, useRef } from 'react';

import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { useProductUpdates } from '@/hooks/use-product-updates';
import useUserPreferences from '@/hooks/use-user-preferences';

import { ProductUpdatesCardStack, type ProductUpdateItem } from '.';

type Props = {
  readonly isHidden?: boolean;
};

function ProductUpdatesContent({ isHidden = false }: Props) {
  const { items, dismissItem, dismissAll } = useProductUpdates();
  const {
    data: { language },
  } = useUserPreferences();
  const postHog = usePostHog();
  const shownIdsRef = useRef<Set<string>>(new Set());

  const handleActiveItemChange = useCallback(
    (item: ProductUpdateItem) => {
      if (shownIdsRef.current.has(item.id)) {
        return;
      }

      shownIdsRef.current.add(item.id);
      postHog.capture('console:update_card_shown', {
        update_id: item.id,
        language,
      });
    },
    [language, postHog]
  );

  const handleOpen = useCallback(
    (item: ProductUpdateItem) => {
      postHog.capture('console:update_card_clicked', {
        update_id: item.id,
        language,
      });
      dismissItem(item.id);
    },
    [dismissItem, language, postHog]
  );

  const handleDismiss = useCallback(
    (item: ProductUpdateItem) => {
      postHog.capture('console:update_card_dismissed', {
        update_id: item.id,
        language,
      });
      dismissItem(item.id);
    },
    [dismissItem, language, postHog]
  );

  const handleDismissAll = useCallback(() => {
    postHog.capture('console:update_dismiss_all', {
      count: items.length,
      update_ids: items.map(({ id }) => id),
      language,
    });
    dismissAll();
  }, [dismissAll, items, language, postHog]);

  if (isHidden || items.length === 0) {
    return null;
  }

  return (
    <ProductUpdatesCardStack
      items={items}
      onOpen={handleOpen}
      onDismiss={handleDismiss}
      onDismissAll={handleDismissAll}
      onActiveItemChange={handleActiveItemChange}
    />
  );
}

function ProductUpdatesContainer({ isHidden = false }: Props) {
  // Product Updates for Logto Cloud
  if (!isCloud || !isDevFeaturesEnabled) {
    return null;
  }

  return <ProductUpdatesContent isHidden={isHidden} />;
}

export default ProductUpdatesContainer;
