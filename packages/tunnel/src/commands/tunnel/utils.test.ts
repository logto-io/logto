import { expect, describe, it } from 'vitest';

import { isFileAssetPath } from './utils.js';

describe('Tunnel utils', () => {
  it('should be able to check if a request path is file asset', () => {
    expect(isFileAssetPath('/file.js')).toBe(true);
    expect(isFileAssetPath('/file.css')).toBe(true);
    expect(isFileAssetPath('/file.png')).toBe(true);
    expect(isFileAssetPath('/oidc/.well-known/openid-configuration')).toBe(false);
    expect(isFileAssetPath('/oidc/auth')).toBe(false);
    expect(isFileAssetPath('/api/interaction/submit')).toBe(false);
    expect(isFileAssetPath('/consent')).toBe(false);
    expect(
      isFileAssetPath(
        '/callback/45doq0d004awrjyvdbp92?state=PxsR_Iqtkxw&code=4/0AcvDMrCOMTFXWlKzTcUO24xDify5tQbIMYvaYDS0sj82NzzYlrG4BWXJB4-OxjBI1RPL8g&scope=email%20profile%20openid%20https:/www.googleapis.com/auth/userinfo.profile%20https:/www.googleapis.com/auth/userinfo.email&authuser=0&hd=silverhand.io&prompt=consent'
      )
    ).toBe(false);
  });
});
