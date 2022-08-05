// FIXME: @Darcy
/* eslint-disable unicorn/text-encoding-identifier-case */
import * as crypto from 'crypto';

import * as iconv from 'iconv-lite';
import snakeCaseKeys from 'snakecase-keys';

import { alipaySigningAlgorithmMapping } from './constant';
import { AlipayNativeConfig } from './types';

export type SigningParameters = (
  parameters: AlipayNativeConfig & Record<string, string | undefined>
) => Record<string, string>;

// Reference: https://github.com/alipay/alipay-sdk-nodejs-all/blob/10d78e0adc7f310d5b07567ce7e4c13a3f6c768f/lib/util.ts
export const signingParameters: SigningParameters = (
  parameters: AlipayNativeConfig & Record<string, string | undefined>
): Record<string, string> => {
  const { biz_content, privateKey, ...rest } = parameters;
  const signParameters = snakeCaseKeys(
    biz_content
      ? {
          ...rest,
          bizContent: JSON.stringify(snakeCaseKeys(JSON.parse(biz_content))),
        }
      : rest
  );

  const decamelizeParameters = snakeCaseKeys(signParameters);

  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  const sortedParametersAsString = Object.entries(decamelizeParameters)
    .map(([key, value]) => {
      // Supported Encodings can be found at https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings

      if (value) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return `${key}=${iconv.encode(value, rest.charset ?? 'UTF8')}`;
      }

      return '';
    })
    .filter(Boolean)
    .sort()
    .join('&');

  const sign = crypto
    .createSign(alipaySigningAlgorithmMapping[rest.signType])
    .update(sortedParametersAsString, 'utf8')
    .sign(privateKey, 'base64');

  return { ...decamelizeParameters, sign };
};
/* eslint-enable unicorn/text-encoding-identifier-case */
