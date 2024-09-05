import { ExtraParamsKey, SignInIdentifier } from '@logto/schemas';
import { renderHook } from '@testing-library/react-hooks';
import * as reactRouterDom from 'react-router-dom';

import useIdentifierParams from './use-identifier-params';

// Mock the react-router-dom module
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
}));

// Helper function to mock search params
const mockSearchParams = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams(params);
  (reactRouterDom.useSearchParams as jest.Mock).mockReturnValue([searchParams]);
};

describe('useIdentifierParams', () => {
  it('should return an empty array when no identifiers are provided', () => {
    mockSearchParams({});
    const { result } = renderHook(() => useIdentifierParams());
    expect(result.current.identifiers).toEqual([]);
  });

  it('should parse and validate a single identifier', () => {
    mockSearchParams({ [ExtraParamsKey.Identifier]: 'email' });
    const { result } = renderHook(() => useIdentifierParams());
    expect(result.current.identifiers).toEqual([SignInIdentifier.Email]);
  });

  it('should parse and validate multiple identifiers', () => {
    mockSearchParams({ [ExtraParamsKey.Identifier]: 'email phone' });
    const { result } = renderHook(() => useIdentifierParams());
    expect(result.current.identifiers).toEqual([SignInIdentifier.Email, SignInIdentifier.Phone]);
  });

  it('should filter out invalid identifiers', () => {
    mockSearchParams({ [ExtraParamsKey.Identifier]: 'email invalid phone' });
    const { result } = renderHook(() => useIdentifierParams());
    expect(result.current.identifiers).toEqual([SignInIdentifier.Email, SignInIdentifier.Phone]);
  });

  it('should handle empty string input', () => {
    mockSearchParams({ [ExtraParamsKey.Identifier]: '' });
    const { result } = renderHook(() => useIdentifierParams());
    expect(result.current.identifiers).toEqual([]);
  });

  it('should handle identifiers with extra spaces', () => {
    mockSearchParams({ [ExtraParamsKey.Identifier]: '  email   phone  ' });
    const { result } = renderHook(() => useIdentifierParams());
    expect(result.current.identifiers).toEqual([SignInIdentifier.Email, SignInIdentifier.Phone]);
  });
});
