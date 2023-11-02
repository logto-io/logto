import { attributeMappingPostProcessor, getExtendedUserInfoFromRawUserProfile } from './utils.js';

const expectedDefaultAttributeMapping = {
  id: 'id',
  email: 'email',
  phone: 'phone',
  name: 'name',
  avatar: 'avatar',
};

describe('attributeMappingPostProcessor', () => {
  it('should fallback to `expectedDefaultAttributeMapping` if no other attribute mapping is specified', () => {
    expect(attributeMappingPostProcessor()).toEqual(expectedDefaultAttributeMapping);
    expect(attributeMappingPostProcessor({})).toEqual(expectedDefaultAttributeMapping);
  });

  it('should overwrite specified attributes of `expectedDefaultAttributeMapping`', () => {
    expect(attributeMappingPostProcessor({ id: 'sub', avatar: 'picture' })).toEqual({
      ...expectedDefaultAttributeMapping,
      id: 'sub',
      avatar: 'picture',
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

  it('should correctly map with specific fields specified and with extended fields unchanged', () => {
    const keyMapping = attributeMappingPostProcessor({ phone: 'cell_phone', avatar: 'picture' });
    const rawUserProfile = {
      id: 'foo',
      sub: 'bar',
      email: 'test@logto.io',
      cell_phone: '123456789',
      picture: 'pic.png',
      extend_field: 'extend_field',
    };
    expect(getExtendedUserInfoFromRawUserProfile(rawUserProfile, keyMapping)).toEqual({
      id: 'foo',
      sub: 'bar',
      email: 'test@logto.io',
      phone: '123456789',
      avatar: 'pic.png',
      extend_field: 'extend_field',
    });
  });
});
