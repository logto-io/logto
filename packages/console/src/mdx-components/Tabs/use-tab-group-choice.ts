import type { Nullable } from '@silverhand/essentials';
import { noop, trySafe } from '@silverhand/essentials';
import { useCallback, useSyncExternalStore } from 'react';

/**
 * Keep guide tab groups in sync: persist the selected tab value per `groupId` in
 * `localStorage`, so every `<Tabs>` sharing the same `groupId` (e.g. the SDK
 * version selector repeated across a guide) reflects the same choice and
 * remembers it across visits.
 */
const getStorageKey = (groupId: string) => `logto:admin_console:guide_tab_group:${groupId}`;

/**
 * The native `storage` event only fires in *other* windows, so we keep our own
 * registry of subscribers per storage key to notify the tab groups living in the
 * current window when the choice changes here.
 */
const currentWindowListeners = new Map<string, Set<() => void>>();

const subscribeCurrentWindow = (key: string, onChange: () => void) => {
  const listeners = currentWindowListeners.get(key) ?? new Set();
  listeners.add(onChange);
  currentWindowListeners.set(key, listeners);

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      currentWindowListeners.delete(key);
    }
  };
};

const notifyCurrentWindow = (key: string) => {
  for (const listener of currentWindowListeners.get(key) ?? []) {
    listener();
  }
};

/**
 * Returns the persisted choice for the given `groupId` and a setter that updates
 * every tab group sharing it. When no `groupId` is provided the hook is a no-op
 * (the tab group keeps its own local selection).
 */
const useTabGroupChoice = (
  groupId?: string
): [choice: Nullable<string>, setChoice: (value: string) => void] => {
  const key = groupId === undefined ? undefined : getStorageKey(groupId);

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (key === undefined) {
        return noop;
      }

      // Cross-window updates arrive through the native `storage` event...
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) {
          onChange();
        }
      };
      window.addEventListener('storage', onStorage);
      // ...while same-window updates come from our own registry.
      const unsubscribeCurrentWindow = subscribeCurrentWindow(key, onChange);

      return () => {
        window.removeEventListener('storage', onStorage);
        unsubscribeCurrentWindow();
      };
    },
    [key]
  );

  const getSnapshot = useCallback(
    () => (key === undefined ? null : (trySafe(() => localStorage.getItem(key)) ?? null)),
    [key]
  );

  const choice = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const setChoice = useCallback(
    (value: string) => {
      if (key === undefined) {
        return;
      }

      trySafe(() => {
        localStorage.setItem(key, value);
      });
      notifyCurrentWindow(key);
    },
    [key]
  );

  return [choice, setChoice];
};

export default useTabGroupChoice;
