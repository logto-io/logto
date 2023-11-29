import { pickLogoForCurrentThemeHelper } from './utils';

describe('pickLogoForCurrentThemeHelper', () => {
  const logo = 'logo';
  const logoDark = 'logoDark';

  it('dark mode, logo non-empty, logoDark non-empty, should get logoDark', () => {
    expect(pickLogoForCurrentThemeHelper(true, logo, logoDark)).toBe(logoDark);
  });

  it('light mode, logo non-empty, logoDark non-empty, should get logo', () => {
    expect(pickLogoForCurrentThemeHelper(false, logo, logoDark)).toBe(logo);
  });

  it('dark mode, logo non-empty, logoDark empty, should get logo', () => {
    expect(pickLogoForCurrentThemeHelper(true, logo, '')).toBe(logo);
  });

  it('light mode, logo non-empty, logoDark empty, should get logo', () => {
    expect(pickLogoForCurrentThemeHelper(false, logo, '')).toBe(logo);
  });

  it('dark mode, logo empty, logoDark non-empty, should get logoDark', () => {
    expect(pickLogoForCurrentThemeHelper(true, '', logoDark)).toBe(logoDark);
  });

  it('light mode, logo empty, logoDark non-empty, should get logoDark', () => {
    expect(pickLogoForCurrentThemeHelper(false, '', logoDark)).toBe(logoDark);
  });

  it('dark mode, logo empty, logoDark empty, should get empty string', () => {
    expect(pickLogoForCurrentThemeHelper(true, '', '')).toBe('');
  });

  it('light mode, logo empty, logoDark empty, should get empty string', () => {
    expect(pickLogoForCurrentThemeHelper(false, '', '')).toBe('');
  });
});
