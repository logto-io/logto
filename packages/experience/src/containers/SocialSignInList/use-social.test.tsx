import { SiweConnector } from '@logto/connector-kit';
import {
  AgreeToTermsPolicy,
  ConnectorPlatform,
  type ExperienceSocialConnector,
} from '@logto/schemas';
import { act, renderHook } from '@testing-library/react';

import useWalletModal from '@/Providers/WalletModalProvider/use-wallet-modal';
import {
  getSocialAuthorizationUrl,
  identifyUser,
  verifySocialVerification,
} from '@/apis/experience';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useStepUpContext from '@/hooks/use-step-up-context';
import useTerms from '@/hooks/use-terms';
import useToast from '@/hooks/use-toast';
import {
  discoverEvmWallets,
  parseSiweAuthorizationParams,
  signInWithEvmWallet,
  WalletError,
  type EvmWallet,
  type SiweAuthorizationParams,
} from '@/utils/wallet/evm';

import useSocial from './use-social';

jest.mock('@/apis/experience', () => ({
  getSocialAuthorizationUrl: jest.fn(),
  identifyUser: jest.fn(),
  initInteraction: jest.fn(),
  verifySocialVerification: jest.fn(),
}));

jest.mock('@/hooks/use-error-handler', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/use-global-redirect-to', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/use-step-up-context', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/use-step-up-error-handler', () => ({
  usePureStepUpErrorHandler: jest.fn(() => ({})),
}));

jest.mock('@/hooks/use-terms', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/Providers/WalletModalProvider/use-wallet-modal', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/utils/wallet/evm', () => {
  class MockWalletError extends Error {
    constructor(
      public readonly code: string,
      message?: string
    ) {
      super(message ?? code);
      this.name = 'WalletError';
    }
  }

  return {
    WalletError: MockWalletError,
    discoverEvmWallets: jest.fn(),
    parseSiweAuthorizationParams: jest.fn(),
    signInWithEvmWallet: jest.fn(),
  };
});

const mockGetSocialAuthorizationUrl = getSocialAuthorizationUrl as jest.MockedFunction<
  typeof getSocialAuthorizationUrl
>;
const mockIdentifyUser = identifyUser as jest.MockedFunction<typeof identifyUser>;
const mockVerifySocialVerification = verifySocialVerification as jest.MockedFunction<
  typeof verifySocialVerification
>;
const mockDiscoverEvmWallets = discoverEvmWallets as jest.MockedFunction<typeof discoverEvmWallets>;
const mockParseSiweAuthorizationParams = parseSiweAuthorizationParams as jest.MockedFunction<
  typeof parseSiweAuthorizationParams
>;
const mockSignInWithEvmWallet = signInWithEvmWallet as jest.MockedFunction<
  typeof signInWithEvmWallet
>;
const mockUseStepUpContext = useStepUpContext as jest.MockedFunction<typeof useStepUpContext>;
const mockUseTerms = useTerms as jest.MockedFunction<typeof useTerms>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockUseNavigate = useNavigateWithPreservedSearchParams as jest.MockedFunction<
  typeof useNavigateWithPreservedSearchParams
>;
const mockUseErrorHandler = useErrorHandler as jest.MockedFunction<typeof useErrorHandler>;
const mockUseGlobalRedirectTo = useGlobalRedirectTo as jest.MockedFunction<
  typeof useGlobalRedirectTo
>;
const mockUseWalletModal = useWalletModal as jest.MockedFunction<typeof useWalletModal>;

const connector: ExperienceSocialConnector = {
  id: 'siwe-connector',
  target: SiweConnector.target,
  name: { en: 'Ethereum Wallet' },
  logo: '',
  logoDark: null,
  platform: ConnectorPlatform.Web,
};

const wallet: EvmWallet = {
  id: 'wallet-1',
  name: 'Test Wallet',
  provider: {
    request: jest.fn(),
  },
};

const authorizationParams: SiweAuthorizationParams = {
  domain: 'example.logto.app',
  uri: 'https://example.logto.app',
  nonce: 'abcdef0123456789',
  issuedAt: '2026-01-01T00:00:00.000Z',
  expirationTime: '2026-01-01T00:10:00.000Z',
  chainIds: [1],
  statement: 'Sign in to Logto',
};

const setToast = jest.fn();
const handleError = jest.fn();
const redirectTo = jest.fn();
const navigate = jest.fn();
const refetchStepUp = jest.fn();
const showWalletModal = jest.fn();

describe('useSocial wallet sign-in', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseStepUpContext.mockReturnValue({
      isPureStepUp: false,
      refetch: refetchStepUp,
    } as never);
    mockUseTerms.mockReturnValue({
      termsValidation: jest.fn(async () => true),
      agreeToTermsPolicy: AgreeToTermsPolicy.Automatic,
    } as never);
    mockUseToast.mockReturnValue({ setToast } as never);
    mockUseNavigate.mockReturnValue(navigate);
    mockUseErrorHandler.mockReturnValue(handleError as never);
    mockUseGlobalRedirectTo.mockReturnValue(redirectTo as never);
    mockUseWalletModal.mockReturnValue({ show: showWalletModal });

    mockGetSocialAuthorizationUrl.mockResolvedValue({
      verificationId: 'verification-1',
      authorizationUri: 'siwe://authorize?nonce=abcdef0123456789',
    });
    mockVerifySocialVerification.mockResolvedValue({ verificationId: 'verification-1' });
    mockDiscoverEvmWallets.mockResolvedValue([wallet]);
    mockParseSiweAuthorizationParams.mockReturnValue(authorizationParams);
    mockSignInWithEvmWallet.mockResolvedValue({
      message: 'siwe-message',
      signature: '0xsignature',
    });
  });

  it('verifies the signature and continues through the social callback', async () => {
    const { result } = renderHook(() => useSocial());

    await act(async () => {
      await result.current.invokeSocialSignIn(connector);
    });

    expect(mockGetSocialAuthorizationUrl).toHaveBeenCalledWith(
      connector.id,
      expect.any(String),
      expect.stringContaining(`/callback/${connector.id}`)
    );
    expect(mockSignInWithEvmWallet).toHaveBeenCalledWith(wallet, authorizationParams);
    expect(mockVerifySocialVerification).toHaveBeenCalledWith(connector.id, {
      verificationId: 'verification-1',
      connectorData: { message: 'siwe-message', signature: '0xsignature' },
    });
    expect(navigate).toHaveBeenCalledWith(
      { pathname: `/callback/social/${connector.id}`, search: 'siwe_callback=1' },
      { replace: true }
    );
  });

  it('refreshes the step-up context before returning to the landing page', async () => {
    mockUseStepUpContext.mockReturnValue({
      isPureStepUp: true,
      refetch: refetchStepUp,
    } as never);

    const { result } = renderHook(() => useSocial());

    await act(async () => {
      await result.current.invokeSocialSignIn(connector);
    });

    expect(mockIdentifyUser).toHaveBeenCalledWith({ verificationId: 'verification-1' });
    expect(refetchStepUp).toHaveBeenCalledTimes(1);
    expect(refetchStepUp.mock.invocationCallOrder[0]).toBeLessThan(
      navigate.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER
    );
    expect(navigate).toHaveBeenCalledWith('/step-up', { replace: true });
  });

  it('shows a specific error when no wallet is available', async () => {
    mockDiscoverEvmWallets.mockResolvedValue([]);

    const { result } = renderHook(() => useSocial());

    await act(async () => {
      await result.current.invokeSocialSignIn(connector);
    });

    expect(setToast).toHaveBeenCalledWith('error.wallet_not_found');
    expect(mockVerifySocialVerification).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('shows a specific error when the wallet rejects the signature request', async () => {
    mockSignInWithEvmWallet.mockRejectedValue(new WalletError('rejected'));

    const { result } = renderHook(() => useSocial());

    await act(async () => {
      await result.current.invokeSocialSignIn(connector);
    });

    expect(setToast).toHaveBeenCalledWith('error.wallet_request_rejected');
    expect(mockVerifySocialVerification).not.toHaveBeenCalled();
  });
});
