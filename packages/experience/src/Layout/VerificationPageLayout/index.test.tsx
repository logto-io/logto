import {
  AuthenticationContextMode,
  type InteractionAuthenticationContext,
  LogtoAcr,
  VerificationType,
} from '@logto/schemas';
import { fireEvent, screen } from '@testing-library/react';
import { Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom';

import StepUpContext from '@/Providers/StepUpContextProvider/StepUpContext';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { isNativeWebview } from '@/utils/native-sdk';

import VerificationPageLayout from '.';

jest.mock('@/utils/native-sdk', () => ({ isNativeWebview: jest.fn(() => false) }));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { dir: () => 'ltr' } }),
}));

const context: InteractionAuthenticationContext = {
  requestedAcrValues: [LogtoAcr.Mfa],
  selectedAcr: LogtoAcr.Mfa,
  mode: AuthenticationContextMode.StepUp,
  availableMethods: [VerificationType.TOTP],
  establishableMethods: [],
  enrollableFactors: [],
  subjectProofConnectors: [],
  maskedIdentifiers: {},
};

const Location = () => {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();
  return <div>{`${navigationType} ${pathname}${search}`}</div>;
};

const Chooser = () => {
  const navigate = useNavigate();
  return (
    <>
      <button
        onClick={() => {
          navigate('/factor');
        }}
      >
        Open factor
      </button>
      <Location />
    </>
  );
};

const renderPage = (
  authenticationContext?: InteractionAuthenticationContext,
  fromChooser = false
) =>
  renderWithPageContext(
    <StepUpContext.Provider
      value={{
        authenticationContext,
        isLoading: false,
        isLoaded: true,
        load: jest.fn(),
        refetch: jest.fn(),
      }}
    >
      <Routes>
        {fromChooser && <Route path="/step-up" element={<Chooser />} />}
        <Route
          path="/factor"
          element={
            <VerificationPageLayout title="mfa.verify_mfa_factors">
              Factor form
            </VerificationPageLayout>
          }
        />
        <Route path="*" element={<Location />} />
      </Routes>
    </StepUpContext.Provider>,
    {
      // No chooser in history: the factor replaced an automatic dispatch or recovery page.
      initialEntries: fromChooser
        ? ['/step-up']
        : ['/sign-in', { pathname: '/factor', state: { isStepUp: true } }],
    }
  );

describe('VerificationPageLayout', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('hides back when pure step-up has only one displayed method', () => {
    const { container } = renderPage(context);

    expect(container.querySelector('.navBar.hidden')).not.toBeNull();
    expect(screen.getByText('Factor form')).not.toBeNull();
  });

  it('counts displayed methods, not a WebAuthn option unavailable in a native webview', () => {
    jest.mocked(isNativeWebview).mockReturnValueOnce(true);
    const { container } = renderPage({
      ...context,
      availableMethods: [VerificationType.TOTP, VerificationType.WebAuthn],
    });

    expect(container.querySelector('.navBar.hidden')).not.toBeNull();
  });

  it('returns to the chooser explicitly even if it is absent from history', () => {
    const { container } = renderPage({
      ...context,
      // Count first-factor alternatives too, not only enrolled MFA factors.
      availableMethods: [VerificationType.TOTP, VerificationType.Password],
    });

    expect(container.querySelector('.navBar.hidden')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'action.nav_back' }));

    expect(screen.getByText('REPLACE /step-up')).not.toBeNull();
  });

  it('uses history back when the chooser pushed the factor page', () => {
    renderPage(
      {
        ...context,
        availableMethods: [VerificationType.TOTP, VerificationType.Password],
      },
      true
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open factor' }));
    fireEvent.click(screen.getByRole('button', { name: 'action.nav_back' }));

    expect(screen.getByText('POP /step-up')).not.toBeNull();
  });

  it.each([
    ['ordinary MFA without a context', undefined],
    ['sign-in with ACR', { ...context, mode: undefined }],
  ])('preserves history back for %s despite the router hint', (_, authenticationContext) => {
    const { container } = renderPage(authenticationContext);

    expect(container.querySelector('.navBar.hidden')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'action.nav_back' }));

    expect(screen.getByText('POP /sign-in')).not.toBeNull();
  });
});
