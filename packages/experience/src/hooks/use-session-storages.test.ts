import { renderHook } from '@testing-library/react-hooks';

import { mockSsoConnectors } from '@/__mocks__/logto';

import useSessionStorage, { StorageKeys } from './use-session-storages';

describe('useSessionStorage', () => {
  it('should set and get a email value', () => {
    const email = 'foo@test.io';
    const { result } = renderHook(() => useSessionStorage());
    const { get, set, remove } = result.current;

    expect(get(StorageKeys.SsoEmail)).toBeUndefined();
    set(StorageKeys.SsoEmail, email);
    expect(get(StorageKeys.SsoEmail)).toBe(email);
    remove(StorageKeys.SsoEmail);
    expect(get(StorageKeys.SsoEmail)).toBeUndefined();
  });

  it('should set and get a sso connectors value', () => {
    const { result } = renderHook(() => useSessionStorage());
    const { get, set, remove } = result.current;

    expect(get(StorageKeys.SsoConnectors)).toBeUndefined();
    set(StorageKeys.SsoConnectors, mockSsoConnectors);
    expect(get(StorageKeys.SsoConnectors)).toStrictEqual(mockSsoConnectors);
    remove(StorageKeys.SsoConnectors);
    expect(get(StorageKeys.SsoConnectors)).toBeUndefined();
  });

  it('should return undefined if the value is invalid', () => {
    const { result } = renderHook(() => useSessionStorage());
    const { get, set } = result.current;

    // @ts-expect-error -- we are testing invalid values
    set(StorageKeys.SsoConnectors, 'foo');
    expect(get(StorageKeys.SsoEmail)).toBeUndefined();
  });
});
