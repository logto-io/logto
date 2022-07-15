import { methodForAccessToken } from './constant';
import { mockedAlipayConfigWithValidPrivateKey, mockedAlipayPublicParameters } from './mock';
import { signingParameters } from './utils';

const listenJSONParse = jest.spyOn(JSON, 'parse');
const listenJSONStringify = jest.spyOn(JSON, 'stringify');

describe('signingParameters', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
      'td9+u0puul3HgbwLGL1X6z/vKKB/K25K5pjtLT/snQOp292RX3Y5j+FQUVuazTI2l65GpoSgA83LWNT9htQgtmdBmkCQ3bO6RWs38+2ZmBmH7MvpHx4ebUDhtebLUmHNuRFaNcpAZW92b0ZSuuJuahpLK8VNBgXljq+x0aD7WCRudPxc9fikR65NGxr5bwepl/9IqgMxwtajh1+PEJyhGGJhJxS1dCktGN0EiWXWNiogYT8NlFVCmw7epByKzCBWu4sPflU52gJMFHTdbav/0Tk/ZBs8RyP8Z8kcJA0jom2iT+dHqDpgkdzEmsR360UVNKCu5X7ltIiiObsAWmfluQ=='
    );
  });

  it('should return exact signature with the given parameters (with empty property in testingParameters)', () => {
    const decamelizedParameters = signingParameters({
      ...testingParameters,
      emptyProperty: '',
    });
    expect(decamelizedParameters.sign).toBe(
      'td9+u0puul3HgbwLGL1X6z/vKKB/K25K5pjtLT/snQOp292RX3Y5j+FQUVuazTI2l65GpoSgA83LWNT9htQgtmdBmkCQ3bO6RWs38+2ZmBmH7MvpHx4ebUDhtebLUmHNuRFaNcpAZW92b0ZSuuJuahpLK8VNBgXljq+x0aD7WCRudPxc9fikR65NGxr5bwepl/9IqgMxwtajh1+PEJyhGGJhJxS1dCktGN0EiWXWNiogYT8NlFVCmw7epByKzCBWu4sPflU52gJMFHTdbav/0Tk/ZBs8RyP8Z8kcJA0jom2iT+dHqDpgkdzEmsR360UVNKCu5X7ltIiiObsAWmfluQ=='
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
