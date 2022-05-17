import { methodForAccessToken } from './constant';
import {
  mockedAlipayNativeConfigWithValidPrivateKey,
  mockedAlipayNativePublicParameters,
} from './mock';
import { signingPamameters } from './utils';

const listenJSONParse = jest.spyOn(JSON, 'parse');
const listenJSONStringify = jest.spyOn(JSON, 'stringify');

describe('signingParameters', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const testingParameters = {
    ...mockedAlipayNativePublicParameters,
    ...mockedAlipayNativeConfigWithValidPrivateKey,
    method: methodForAccessToken,
    code: '7ffeb112fbb6495c9e7dfb720380DD39',
  };

  it('should return exact signature with the given parameters (functionality check)', () => {
    const decamelizedParameters = signingPamameters(testingParameters);
    expect(decamelizedParameters.sign).toBe(
      'K2ixSdVP1GoqJk97FrrR1rBpIN/v78D1l17EZHwFWzUvXWp79s9IDLP7rpU7pGDmh/Rpvn+3EXmuWWz9Bxg3H70+sdJ46+e2cZ/sV57EtwcDVOX6r2f8wSQkNd9jH5OKd+Otga7hAY0YL7HHdU4ay6DLIHQPg5CylCOAYyE1yjrExqXygav6diNMm4nL9C2mNqBDLRMOj5KS0FGz63UKsyRSWYyG7hAfTyGnmDrmivjbgamoyUG/XsXR6rCPePPyn7bc5gOxZbE0BddKFH6K6lnAnpmHVgIo8WYgA6V8hzsp1SsEmtwFnqORKpHuP8cxM1bOpF91JCMfowBbazEURA=='
    );
  });

  it('should return exact signature with the given parameters (with empty property in testingParameters)', () => {
    const decamelizedParameters = signingPamameters({
      ...testingParameters,
      emptyProperty: '',
    });
    expect(decamelizedParameters.sign).toBe(
      'K2ixSdVP1GoqJk97FrrR1rBpIN/v78D1l17EZHwFWzUvXWp79s9IDLP7rpU7pGDmh/Rpvn+3EXmuWWz9Bxg3H70+sdJ46+e2cZ/sV57EtwcDVOX6r2f8wSQkNd9jH5OKd+Otga7hAY0YL7HHdU4ay6DLIHQPg5CylCOAYyE1yjrExqXygav6diNMm4nL9C2mNqBDLRMOj5KS0FGz63UKsyRSWYyG7hAfTyGnmDrmivjbgamoyUG/XsXR6rCPePPyn7bc5gOxZbE0BddKFH6K6lnAnpmHVgIo8WYgA6V8hzsp1SsEmtwFnqORKpHuP8cxM1bOpF91JCMfowBbazEURA=='
    );
  });

  it('should not call JSON.parse() when biz_content is empty', () => {
    signingPamameters(testingParameters);
    expect(listenJSONParse).not.toHaveBeenCalled();
  });

  it('should call JSON.parse() when biz_content is not empty', () => {
    signingPamameters({
      ...testingParameters,
      biz_content: JSON.stringify({ AB: 'AB' }),
    });
    expect(listenJSONParse).toHaveBeenCalled();
  });

  it('should call JSON.stringify() when some value is object string', () => {
    signingPamameters({
      ...testingParameters,
      testObject: JSON.stringify({ AB: 'AB' }),
    });
    expect(listenJSONStringify).toHaveBeenCalled();
  });
});
