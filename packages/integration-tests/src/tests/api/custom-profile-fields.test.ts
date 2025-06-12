import { CustomProfileFieldType } from '@logto/schemas';

import {
  primaryEmailData,
  fullnameData,
  birthDateData,
  genderData,
  addressData,
  websiteData,
} from '#src/__mocks__/profile-fields-mock.js';
import {
  createCustomProfileField,
  deleteCustomProfileFieldById,
  findCustomProfileFieldById,
  findAllCustomProfileFields,
  updateCustomProfileFieldById,
  updateCustomProfileFieldsSieOrder,
} from '#src/api/index.js';
import { expectRejects } from '#src/helpers/index.js';
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('custom profile fields API', () => {
  it('should create custom profile field and find it by ID', async () => {
    const customProfileField = await createCustomProfileField(primaryEmailData);

    expect(customProfileField).toMatchObject({
      ...primaryEmailData,
      sieOrder: 1,
    });

    const foundCustomProfileField = await findCustomProfileFieldById(customProfileField.id);
    expect(foundCustomProfileField).toMatchObject(customProfileField);

    void deleteCustomProfileFieldById(customProfileField.id);
  });

  it('should fail to create if field name is empty', async () => {
    await expectRejects(
      createCustomProfileField({
        name: '',
        type: CustomProfileFieldType.Text,
        label: 'Email address',
      }),
      {
        code: 'guard.invalid_input',
        status: 400,
      }
    );
  });

  it('should fail to create if field type is invalid', async () => {
    await expectRejects(
      createCustomProfileField({
        name: 'primaryEmail',
        // @ts-expect-error Invalid type
        type: 'invalid',
        label: 'Email address',
      }),
      {
        code: 'guard.invalid_input',
        status: 400,
      }
    );
  });

  it('should fail to create if field name is conflicted', async () => {
    const emailField = await createCustomProfileField(primaryEmailData);
    await expectRejects(createCustomProfileField(primaryEmailData), {
      code: 'custom_profile_fields.name_exists',
      status: 422,
    });

    void deleteCustomProfileFieldById(emailField.id);
  });

  it('should update custom profile field', async () => {
    const emailField = await createCustomProfileField(primaryEmailData);
    const fullnameField = await createCustomProfileField(fullnameData);

    expect(fullnameField).toMatchObject({
      ...fullnameData,
      sieOrder: 2,
    });

    const dataToUpdate = {
      description: 'Your fullname (Given name and family name)',
      config: {
        placeholder: 'Please enter your fullname',
        parts: [
          { key: 'givenName', enabled: true },
          { key: 'middleName', enabled: true },
          { key: 'familyName', enabled: true },
        ],
      },
    };
    const updatedFullnameField = await updateCustomProfileFieldById(fullnameField.id, dataToUpdate);

    expect(updatedFullnameField).toMatchObject({
      ...fullnameData,
      sieOrder: 2,
      ...dataToUpdate,
    });

    void deleteCustomProfileFieldById(emailField.id);
    void deleteCustomProfileFieldById(fullnameField.id);
  });

  it('should not be able to update the name, type, and sieOrder', async () => {
    const emailField = await createCustomProfileField(primaryEmailData);

    await updateCustomProfileFieldById(emailField.id, {
      // @ts-expect-error Invalid update
      name: 'newName',
      type: CustomProfileFieldType.Regex,
      sieOrder: 5,
      label: 'New label',
    });

    expect(emailField).toMatchObject({
      ...primaryEmailData,
      sieOrder: 1,
    });

    void deleteCustomProfileFieldById(emailField.id);
  });

  it('should fail to find custom profile field by invalid ID', async () => {
    await expectRejects(findCustomProfileFieldById('invalid-id'), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
  });

  it('should fail to update custom profile field by invalid ID', async () => {
    await expectRejects(updateCustomProfileFieldById('invalid-id', { label: 'hello' }), {
      code: 'entity.not_exists',
      status: 404,
    });
  });

  it('should fail to delete custom profile field by invalid ID', async () => {
    await expectRejects(deleteCustomProfileFieldById('invalid-id'), {
      code: 'entity.not_found',
      status: 404,
    });
  });

  it('should be able to reorder the custom profile fields in sign-in experience', async () => {
    const websiteField = await createCustomProfileField(websiteData);
    const addressField = await createCustomProfileField(addressData);
    const birthDateField = await createCustomProfileField(birthDateData);

    expect(websiteField).toMatchObject({
      ...websiteData,
      sieOrder: 1,
    });
    expect(addressField).toMatchObject({
      ...addressData,
      sieOrder: 2,
    });
    expect(birthDateField).toMatchObject({
      ...birthDateData,
      sieOrder: 3,
    });

    await updateCustomProfileFieldsSieOrder([
      { id: websiteField.id, sieOrder: 3 },
      { id: addressField.id, sieOrder: 5 },
      { id: birthDateField.id, sieOrder: 4 },
    ]);

    const fields = await findAllCustomProfileFields();

    expect(fields).toMatchObject([
      {
        ...websiteData,
        id: websiteField.id,
        sieOrder: 3,
      },
      {
        ...birthDateData,
        id: birthDateField.id,
        sieOrder: 4,
      },
      {
        ...addressData,
        id: addressField.id,
        sieOrder: 5,
      },
    ]);

    const genderField = await createCustomProfileField(genderData);

    expect(genderField).toMatchObject({
      ...genderData,
      sieOrder: 6,
    });

    void deleteCustomProfileFieldById(websiteField.id);
    void deleteCustomProfileFieldById(addressField.id);
    void deleteCustomProfileFieldById(birthDateField.id);
    void deleteCustomProfileFieldById(genderField.id);
  });
});
