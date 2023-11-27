import { attributeMappingPostProcessor, getExtendedUserInfoFromRawUserProfile } from './utils.js';

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
