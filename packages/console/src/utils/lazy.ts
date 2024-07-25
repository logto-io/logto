import { type ComponentType, lazy } from 'react';

class ForceReloadStorage {
  storageKey = 'forceReloadedFunctionNames';

  getNames(): Set<string> {
    const stored = sessionStorage.getItem(this.storageKey);

    try {
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      return new Set(
        Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : undefined
      );
    } catch (error) {
      console.error(error);
      return new Set();
    }
  }

  addName(functionName: string) {
    const stored = this.getNames();
    stored.add(functionName);
    sessionStorage.setItem(this.storageKey, JSON.stringify(Array.from(stored)));
  }

  removeName(functionName: string) {
    const stored = this.getNames();
    stored.delete(functionName);
    sessionStorage.setItem(this.storageKey, JSON.stringify(Array.from(stored)));
  }
}

const reloadStorage = new ForceReloadStorage();

/**
 * A wrapper around React's `lazy` function that reloads the page if the lazy-loaded component
 * fails to load. If the component fails to load twice, it will not attempt to reload the page
 * again.
 */
const safeLazy = <T>(importFunction: () => Promise<{ default: ComponentType<T> }>) =>
  lazy(async () => {
    const functionString = importFunction.toString();

    try {
      const component = await importFunction();
      reloadStorage.removeName(functionString);
      return component;
    } catch (error) {
      console.error(error);

      if (!reloadStorage.getNames().has(functionString)) {
        reloadStorage.addName(functionString);
        window.location.reload();
        return { default: () => null };
      }

      throw error;
    }
  });

export default safeLazy;
