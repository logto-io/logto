import { methodForAccessToken } from './constant.js';
import { mockedAlipayConfigWithValidPrivateKey, mockedAlipayPublicParameters } from './mock.js';
import { signingParameters } from './utils.js';

const listenJSONParse = vi.spyOn(JSON, 'parse');
const listenJSONStringify = vi.spyOn(JSON, 'stringify');

describe('signingParameters', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const testingParameters = {
    ...mockedAlipayPublicParameters,
    ...mockedAlipayConfigWithValidPrivateKey,
    method: methodForAccessToken,
    code: '7ffeb112fbb6495c9e7dfb720380DD39',
  };

  it('should return exact signature with the given parameters (functionality check)', () => {
    const decamelizedParameters = signingParameters(testingParameters);
    expect(decamelizedParameters.sign).toBe(
      'jqVzRnwdvBEIocvKGZlZ4X3CK0pEsm8HpRWL9FtGS+P8ZRehh+Wvb3lmXWf0fhTIHmcZahQMAnLFO3OmqcwlUrs4PuRgPVmLG6mK087tkw/GP18hlstnD1hN3DS98eZZQsn8psxdHQ1qtzuik1fM0hiZvR7d/Pr72yNhIzgzWa66wBXJGYc6cmSQzB7g5hFg7L/SC55Xk205tkXkenPO9ti2TY8+bWOEZ4hAteWGftwCROz+1ne3EVrt2e/LpQQvRmDPhMIRVEShmcGTNj0ovnjN2K4Uo/YB7+hPLJkrGpYBV4hDEV91KQ9RybmE927xgIzXl7xbiHvK+BayFGNzFA=='
    );
  });

  it('should return exact signature with the given parameters (with empty property in testingParameters)', () => {
    const decamelizedParameters = signingParameters({
      ...testingParameters,
      emptyProperty: '',
    });
    expect(decamelizedParameters.sign).toBe(
      'jqVzRnwdvBEIocvKGZlZ4X3CK0pEsm8HpRWL9FtGS+P8ZRehh+Wvb3lmXWf0fhTIHmcZahQMAnLFO3OmqcwlUrs4PuRgPVmLG6mK087tkw/GP18hlstnD1hN3DS98eZZQsn8psxdHQ1qtzuik1fM0hiZvR7d/Pr72yNhIzgzWa66wBXJGYc6cmSQzB7g5hFg7L/SC55Xk205tkXkenPO9ti2TY8+bWOEZ4hAteWGftwCROz+1ne3EVrt2e/LpQQvRmDPhMIRVEShmcGTNj0ovnjN2K4Uo/YB7+hPLJkrGpYBV4hDEV91KQ9RybmE927xgIzXl7xbiHvK+BayFGNzFA=='
    );
  });

  it('should not call JSON.parse() when biz_content is empty', () => {
    signingParameters(testingParameters);
    expect(listenJSONParse).not.toHaveBeenCalled();
  });

  it('should call JSON.parse() when biz_content is not empty', () => {
    signingParameters({
      ...testingParameters,
      biz_content: JSON.stringify({ AB: 'AB' }),
    });
    expect(listenJSONParse).toHaveBeenCalled();
  });

  it('should call JSON.stringify() when some value is object string', () => {
    signingParameters({
      ...testingParameters,
      testObject: JSON.stringify({ AB: 'AB' }),
    });
    expect(listenJSONStringify).toHaveBeenCalled();
  });
});
