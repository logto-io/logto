import { useParams as useParamsMock } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { mockSsoConnectors, socialConnectors } from '@/__mocks__/logto';

import DirectSignIn from '.';

jest.mock('@/hooks/use-sie', () => ({
  useSieMethods: jest.fn().mockReturnValue({
    socialConnectors,
    ssoConnectors: mockSsoConnectors,
  }),
}));

jest.mock('@/containers/SocialSignInList/use-social', () =>
  jest.fn().mockReturnValue({
    invokeSocialSignIn: jest.fn(() => {
      window.location.assign('/social-redirect-to');
    }),
  })
);

jest.mock('@/hooks/use-single-sign-on', () =>
  jest.fn().mockReturnValue(
    jest.fn(() => {
      window.location.assign('/sso-redirect-to');
    })
  )
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({}),
}));

const useParams = useParamsMock as jest.Mock;

const assign = jest.fn();
const replace = jest.fn();
const search = jest.fn();
const originalLocation = window.location;
const originalSearch = window.location.search;

beforeAll(() => {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(window, 'location', {
    value: {
      assign,
      replace,
    },
    writable: true,
  });

  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(window.location, 'search', {
    get: search,
  });
});

afterAll(() => {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(window, 'location', {
    value: originalLocation,
  });
});

describe('DirectSignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fallback to the first screen when `directSignIn` is not provided', () => {
    renderWithPageContext(<DirectSignIn />);
    expect(replace).toBeCalledWith('/sign-in');
  });

  it('should fallback to the first screen when `directSignIn` is invalid', () => {
    useParams.mockReturnValue({ method: 'foo' });
    renderWithPageContext(<DirectSignIn />);
    expect(replace).toBeCalledWith('/sign-in');
  });

  it('should fallback to the first screen provided in the fallback parameter', () => {
    useParams.mockReturnValue({ method: 'method', target: 'target' });
    search.mockReturnValue('?fallback=register');
    renderWithPageContext(<DirectSignIn />);
    expect(replace).toBeCalledWith('/register');
  });

  it('should fallback to the first screen when method is valid but target is invalid (social)', () => {
    useParams.mockReturnValue({ method: 'social', target: 'something' });
    search.mockReturnValue('?fallback=sign-in');
    renderWithPageContext(<DirectSignIn />);
    expect(replace).toBeCalledWith('/sign-in');
  });

  it('should fallback to the first screen when method is valid but target is invalid (sso)', () => {
    useParams.mockReturnValue({ method: 'sso', target: 'something' });
    search.mockReturnValue('?fallback=sign-in');
    renderWithPageContext(<DirectSignIn />);
    expect(replace).toBeCalledWith('/sign-in');
  });

  it('should invoke social sign-in when method is social and target is valid (social)', () => {
    useParams.mockReturnValue({ method: 'social', target: socialConnectors[0]!.target });
    search.mockReturnValue(`?fallback=sign-in`);

    renderWithPageContext(<DirectSignIn />);

    expect(replace).not.toBeCalled();
    expect(assign).toBeCalledWith('/social-redirect-to');
  });

  it('should invoke sso sign-in when method is sso and target is valid (sso)', () => {
    useParams.mockReturnValue({ method: 'sso', target: mockSsoConnectors[0]!.id });
    search.mockReturnValue(`?fallback=sign-in`);

    renderWithPageContext(<DirectSignIn />);

    expect(replace).not.toBeCalled();
    expect(assign).toBeCalledWith('/sso-redirect-to');
  });
});
