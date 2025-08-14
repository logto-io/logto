import {
  CustomProfileFieldType,
  type CustomProfileFieldUnion,
  type FullnameProfileField,
} from '@logto/schemas';

import {
  nameData,
  fullnameData,
  birthDateData,
  genderData,
  addressData,
  websiteData,
} from '#src/__mocks__/profile-fields-mock.js';
import {
  createCustomProfileField,
  deleteCustomProfileFieldByName,
  findCustomProfileFieldByName,
  findAllCustomProfileFields,
  updateCustomProfileFieldByName,
  updateCustomProfileFieldsSieOrder,
  batchCreateCustomProfileFields,
} from '#src/api/index.js';
import { expectRejects } from '#src/helpers/index.js';
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('custom profile fields API', () => {
  it('should create custom profile field and find it by name', async () => {
    const customProfileField = await createCustomProfileField(nameData);

    expect(customProfileField).toMatchObject({
      ...nameData,
      sieOrder: 1,
    });

    const foundCustomProfileField = await findCustomProfileFieldByName(customProfileField.name);
    expect(foundCustomProfileField).toMatchObject(customProfileField);

    void deleteCustomProfileFieldByName(customProfileField.name);
  });

  it('should fail to create if field name is empty', async () => {
    await expectRejects(
      createCustomProfileField({
        name: '',
        type: CustomProfileFieldType.Text,
        label: 'Email address',
        required: true,
      }),
      {
        code: 'custom_profile_fields.invalid_name',
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

  it('should fail to create if address field contains invalid sub-component type', async () => {
    await expectRejects(
      createCustomProfileField({
        name: 'address',
        type: CustomProfileFieldType.Address,
        required: true,
        config: {
          parts: [
            {
              name: 'formatted',
              type: CustomProfileFieldType.Address,
              enabled: true,
              required: true,
            },
          ],
        },
      }),
      {
        code: 'custom_profile_fields.invalid_sub_component_type',
        status: 400,
      }
    );
    await expectRejects(
      createCustomProfileField({
        name: 'address',
        type: CustomProfileFieldType.Address,
        required: true,
        config: {
          parts: [
            {
              name: 'formatted',
              type: CustomProfileFieldType.Fullname,
              enabled: true,
              required: true,
            },
          ],
        },
      }),
      {
        code: 'custom_profile_fields.invalid_sub_component_type',
        status: 400,
      }
    );
  });

  it('should fail to create if fullname field contains invalid sub-component type', async () => {
    await expectRejects(
      createCustomProfileField({
        name: 'fullname',
        type: CustomProfileFieldType.Fullname,
        required: true,
        config: {
          parts: [
            {
              name: 'givenName',
              type: CustomProfileFieldType.Fullname,
              enabled: true,
              required: true,
            },
          ],
        },
      }),
      {
        code: 'custom_profile_fields.invalid_sub_component_type',
        status: 400,
      }
    );
    await expectRejects(
      createCustomProfileField({
        name: 'fullname',
        type: CustomProfileFieldType.Fullname,
        required: true,
        config: {
          parts: [
            {
              name: 'middleName',
              type: CustomProfileFieldType.Address,
              enabled: true,
              required: true,
            },
          ],
        },
      }),
      {
        code: 'custom_profile_fields.invalid_sub_component_type',
        status: 400,
      }
    );
  });

  it('should fail to create if field name is conflicted', async () => {
    const nameField = await createCustomProfileField(nameData);
    await expectRejects(createCustomProfileField(nameData), {
      code: 'custom_profile_fields.name_exists',
      status: 422,
    });

    void deleteCustomProfileFieldByName(nameField.name);
  });

  it('should fail to create if field name is invalid format', async () => {
    await expectRejects(
      createCustomProfileField({
        name: '',
        type: CustomProfileFieldType.Text,
        label: 'Invalid name',
        required: true,
      }),
      {
        code: 'custom_profile_fields.invalid_name',
        status: 400,
      }
    );
    await expectRejects(
      createCustomProfileField({
        name: 'customData.test',
        type: CustomProfileFieldType.Text,
        label: 'Invalid name',
        required: true,
      }),
      {
        code: 'custom_profile_fields.invalid_name',
        status: 400,
      }
    );
    await expectRejects(
      createCustomProfileField({
        name: '123-456',
        type: CustomProfileFieldType.Text,
        label: 'Invalid name',
        required: true,
      }),
      {
        code: 'custom_profile_fields.invalid_name',
        status: 400,
      }
    );
  });

  it('should fail to create if field name is conflict with sign-in identifier', async () => {
    await expectRejects(
      createCustomProfileField({
        name: 'primaryEmail',
        type: CustomProfileFieldType.Text,
        label: 'Email address',
        required: true,
      }),
      {
        code: 'custom_profile_fields.name_conflict_sign_in_identifier',
        status: 400,
      }
    );
  });

  it('should fail to create if field name is "preferredUsername"', async () => {
    await expectRejects(
      createCustomProfileField({
        name: 'preferredUsername',
        type: CustomProfileFieldType.Text,
        required: true,
      }),
      {
        code: 'custom_profile_fields.name_conflict_built_in_prop',
        status: 400,
      }
    );
  });

  it('should update custom profile field', async () => {
    const nameField = await createCustomProfileField(nameData);
    const fullnameField = await createCustomProfileField(fullnameData);

    expect(fullnameField).toMatchObject({
      ...fullnameData,
      sieOrder: 2,
    });

    const dataToUpdate = {
      ...fullnameData,
      description: 'Your fullname (Given name and family name)',
      config: {
        parts: [
          {
            name: 'givenName',
            enabled: true,
            type: CustomProfileFieldType.Text,
            label: 'Given name',
            required: true,
          },
          {
            name: 'middleName',
            enabled: true,
            type: CustomProfileFieldType.Text,
            label: 'Middle name',
            required: true,
          },
          {
            name: 'familyName',
            enabled: true,
            type: CustomProfileFieldType.Text,
            label: 'Family name',
            required: true,
          },
        ],
      },
    } satisfies Partial<FullnameProfileField>;

    const updatedFullnameField = await updateCustomProfileFieldByName(
      fullnameField.name,
      dataToUpdate
    );

    expect(updatedFullnameField).toMatchObject({
      ...fullnameData,
      sieOrder: 2,
      ...dataToUpdate,
    });

    void deleteCustomProfileFieldByName(nameField.name);
    void deleteCustomProfileFieldByName(fullnameField.name);
  });

  it('should not be able to update the name, and sieOrder', async () => {
    const nameField = await createCustomProfileField(nameData);

    const updatedField = await updateCustomProfileFieldByName(nameField.name, {
      ...nameData,
      // @ts-expect-error Invalid update name and type
      name: 'newName',
      sieOrder: 5,
      label: 'New label',
    });

    // Only label is updated, name and sieOrder are not changed
    expect(updatedField).toMatchObject({
      ...nameField,
      label: 'New label',
    });

    void deleteCustomProfileFieldByName(nameField.name);
  });

  it('should fail to update custom profile field by non-existent name', async () => {
    await expectRejects(updateCustomProfileFieldByName('nonExistName', nameData), {
      code: 'entity.not_exists',
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
      { name: websiteField.name, sieOrder: 3 },
      { name: addressField.name, sieOrder: 5 },
      { name: birthDateField.name, sieOrder: 4 },
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

    void deleteCustomProfileFieldByName(websiteField.name);
    void deleteCustomProfileFieldByName(addressField.name);
    void deleteCustomProfileFieldByName(birthDateField.name);
    void deleteCustomProfileFieldByName(genderField.name);
  });

  it('should be able to batch create custom profile fields', async () => {
    const fieldsToCreate = [
      nameData,
      fullnameData,
      websiteData,
      addressData,
      birthDateData,
      genderData,
    ];
    const createdFields = await batchCreateCustomProfileFields(fieldsToCreate);

    expect(createdFields).toHaveLength(fieldsToCreate.length);
    expect(createdFields).toMatchObject(fieldsToCreate);

    for (const field of createdFields) {
      void deleteCustomProfileFieldByName(field.name);
    }
  });

  it('should fail to batch create more than 20 profile fields', async () => {
    const fieldsToCreate = Array.from({ length: 21 }).map((_, index) => ({
      name: `field${index}`,
      type: CustomProfileFieldType.Text,
      required: false,
    })) satisfies CustomProfileFieldUnion[];

    const zodData = await expectRejects<{
      issues: Array<{ code: string; maximum?: number; type?: string }>;
    }>(batchCreateCustomProfileFields(fieldsToCreate), {
      code: 'guard.invalid_input',
      status: 400,
    });

    expect(zodData.issues[0]).toMatchObject({ code: 'too_big', maximum: 20, type: 'array' });
  });
});
