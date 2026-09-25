import { Theme, ssrPlaceholder } from '@logto/schemas';

import { getThemeOverride } from './theme';

const setLogtoSsr = (value: typeof logtoSsr) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- tests stage the SSR global
  window.logtoSsr = value;
};

/** Only the branch `getThemeOverride` reads; the rest of the payload is irrelevant here. */
const ssrWithTheme = (theme?: Theme) =>
  ({ signInExperience: { theme } }) as unknown as typeof logtoSsr;

describe('getThemeOverride', () => {
  afterEach(() => {
    setLogtoSsr(ssrPlaceholder);
  });

  it('should return the theme the server resolved for this authentication request', () => {
    setLogtoSsr(ssrWithTheme(Theme.Dark));

    expect(getThemeOverride()).toBe(Theme.Dark);
  });

  it('should return undefined when the request carries no override', () => {
    setLogtoSsr(ssrWithTheme());

    expect(getThemeOverride()).toBeUndefined();
  });

  it('should return undefined when the page was served without SSR data', () => {
    expect(getThemeOverride()).toBeUndefined();
  });
});
