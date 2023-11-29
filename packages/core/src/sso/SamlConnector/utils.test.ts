import {
  attributeMappingPostProcessor,
  getExtendedUserInfoFromRawUserProfile,
  getPemCertificate,
} from './utils.js';

const expectedDefaultAttributeMapping = {
  id: 'nameID',
  email: 'email',
  name: 'name',
};

describe('attributeMappingPostProcessor', () => {
  it('should fallback to `expectedDefaultAttributeMapping` if no other attribute mapping is specified', () => {
    expect(attributeMappingPostProcessor()).toEqual(expectedDefaultAttributeMapping);
    expect(attributeMappingPostProcessor({})).toEqual(expectedDefaultAttributeMapping);
  });

  it('should overwrite specified attributes of `expectedDefaultAttributeMapping`', () => {
    expect(attributeMappingPostProcessor({ id: 'sub' })).toEqual({
      ...expectedDefaultAttributeMapping,
      id: 'sub',
    });
  });
});

describe('getExtendedUserInfoFromRawUserProfile', () => {
  it('should correctly map even if attributeMap is not specified', () => {
    const keyMapping = attributeMappingPostProcessor();
    const rawUserProfile = {
      id: 'foo',
      picture: 'pic.png',
    };
    expect(getExtendedUserInfoFromRawUserProfile(rawUserProfile, keyMapping)).toEqual(
      rawUserProfile
    );
  });

  it('should correctly map with specific fields specified', () => {
    const keyMapping = attributeMappingPostProcessor({ id: 'sub' });
    const rawUserProfile = {
      sub: 'foo',
      avatar: 'pic.png',
    };
    expect(getExtendedUserInfoFromRawUserProfile(rawUserProfile, keyMapping)).toEqual({
      id: 'foo',
      avatar: 'pic.png',
    });
  });
});

const testCertificate =
  '-----BEGIN CERTIFICATE-----\nMIIC8DCCAdigAwIBAgIQcu5YCNUIL6JNotFNdirF2DANBgkqhkiG9w0BAQsFADA0MTIwMAYDVQQDEylNaWNyb3NvZnQgQXp1cmUgRmVkZXJhdGVkIFNTTyBDZXJ0aWZpY2F0ZTAeFw0yMzEwMjUwODAyMDNaFw0yNjEwMjUwODAyMDNaMDQxMjAwBgNVBAMTKU1pY3Jvc29mdCBBenVyZSBGZWRlcmF0ZWQgU1NPIENlcnRpZmljYXRlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2EC5TZmW2ePPI0Od2Z3qFykouY/R8SBVJDD9xUcAIocMSqMLsxqd9ydkjaNC+QLbBUnpCvUd7+7ZyVcABbr5ixIMU+yxKIoZQdchECyasrR4HHXHXMeijQ8ziyF3Ys1yRB+iVQd2wZI+26pXlq9/bmT/keqMqdbAFD78QAYVF0LniL+sQav9Y0tsgrqXaE0GzqpTUsUfEcc1kynIQQG4ltFAkMTqaDhgw44S1GErjYC91dPEZMj4Ywwf1FIfnNJaRZoG77F3SlWUg345z/kAHBzNKjFMq3deobCHDZCZBJ6a+ABzgqdunUo4xBFG/YHNjjGkZEImALwp+P45mF5OLQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQAK7s967KnFm0d7R1HpTHhr6D+L/X2Ejmgawo2HlkFLsHXPgGkeogrXl0Fw6NImJ+Zo/ChE2Vb8ZeYoEz5mdAYc0hK4k4UWJkv3yZ0GPKOzEcIWZ8Q8WAKqqWnzaO8NmZKpdc/sk8PluKH/BJ7IjEHZUgzhmuRGuJGJhVn2EPLXFIxBubyRlyMhBEZvX4syeeiCwGzvZY9CoTUPqftlrvc1xs78GFN+8cT2+B0vjcbifMkZ1Hq0iPQLN/LotM1qGbSVu/OFhuA+8mnp3Acw3XNZPOy9dZdNiVBF8ZoUz0rAC64dKYROPEDJhBTF30UzDcq6lfLA9KAgzEzupAxB8D4N\n-----END CERTIFICATE-----';

describe('getPemCertificate', () => {
  it('should not throw error with a valid certificate', () => {
    expect(() => getPemCertificate(testCertificate)).not.toThrow();
  });
});
