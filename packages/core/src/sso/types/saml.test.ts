import { attributeMappingPostProcessor } from './saml.js';

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
