import { type User } from '@logto/schemas';

import { authedAdminApi, deleteUser } from '#src/api/index.js';
import { createUserByAdmin, expectRejects } from '#src/helpers/index.js';

const getUsers = async <T>(init: string[][]): Promise<{ headers: Headers; json: T }> => {
  const response = await authedAdminApi.get('users', {
    searchParams: new URLSearchParams(init),
  });

  return { headers: response.headers, json: (await response.json()) as T };
};

describe('admin console user search params - customData', () => {
  const userPrefix = 'search_custom_data_';
  const users: User[] = [];

  beforeAll(async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    users.push(
      ...(await Promise.all([
        createUserByAdmin({
          username: userPrefix + 'number',
          customData: { group: userPrefix, qq: 114_514 },
        }),
        createUserByAdmin({
          username: userPrefix + 'string',
          customData: { group: userPrefix, qq: '114514' },
        }),
        createUserByAdmin({
          username: userPrefix + 'nested',
          customData: { group: userPrefix, profile: { tier: 'gold', tags: ['vip', 'beta'] } },
        }),
        createUserByAdmin({
          username: userPrefix + 'null',
          customData: { group: userPrefix, nullable: null },
        }),
      ]))
    );
  });

  afterAll(async () => {
    await Promise.all(users.map(async ({ id }) => deleteUser(id)));
  });

  const findUsersByCustomData = async (customData: string[]) => {
    const { headers, json } = await getUsers<User[]>(
      customData.map((value) => ['customData', value])
    );

    return {
      total: headers.get('total-number'),
      ids: json.map(({ id }) => id),
    };
  };

  it('should match JSON types strictly', async () => {
    const numberResult = await findUsersByCustomData([`{"group":"${userPrefix}","qq":114514}`]);
    expect(numberResult.total).toEqual('1');
    expect(numberResult.ids).toEqual([users[0]!.id]);

    const stringResult = await findUsersByCustomData([`{"group":"${userPrefix}","qq":"114514"}`]);
    expect(stringResult.total).toEqual('1');
    expect(stringResult.ids).toEqual([users[1]!.id]);
  });

  it('should match nested objects recursively', async () => {
    const result = await findUsersByCustomData([
      `{"group":"${userPrefix}","profile":{"tier":"gold"}}`,
    ]);

    expect(result.total).toEqual('1');
    expect(result.ids).toEqual([users[2]!.id]);
  });

  it('should match array elements regardless of order', async () => {
    const singleElement = await findUsersByCustomData([
      `{"group":"${userPrefix}","profile":{"tags":["beta"]}}`,
    ]);
    expect(singleElement.total).toEqual('1');
    expect(singleElement.ids).toEqual([users[2]!.id]);

    const reordered = await findUsersByCustomData([
      `{"group":"${userPrefix}","profile":{"tags":["beta","vip"]}}`,
    ]);
    expect(reordered.total).toEqual('1');
    expect(reordered.ids).toEqual([users[2]!.id]);
  });

  it('should match explicit null but not a missing key', async () => {
    const explicitNull = await findUsersByCustomData([`{"group":"${userPrefix}","nullable":null}`]);
    expect(explicitNull.total).toEqual('1');
    expect(explicitNull.ids).toEqual([users[3]!.id]);

    const missing = await findUsersByCustomData([`{"group":"${userPrefix}","missing":null}`]);
    expect(missing.total).toEqual('0');
    expect(missing.ids).toEqual([]);
  });

  it('should combine repeated customData parameters with OR', async () => {
    const result = await findUsersByCustomData([
      `{"group":"${userPrefix}","qq":114514}`,
      `{"group":"${userPrefix}","qq":"114514"}`,
    ]);

    expect(result.total).toEqual('2');
    expect(result.ids).toEqual(expect.arrayContaining([users[0]!.id, users[1]!.id]));
  });

  it('should combine customData with search using AND', async () => {
    const { headers, json } = await getUsers<User[]>([
      ['customData', `{"group":"${userPrefix}"}`],
      ['search.username', userPrefix + 'nested'],
    ]);

    expect(headers.get('total-number')).toEqual('1');
    expect(json).toHaveLength(1);
    expect(json[0]?.id).toEqual(users[2]!.id);
  });

  it('should ignore the global search modifiers', async () => {
    const { headers } = await getUsers<User[]>([
      ['customData', `{"group":"${userPrefix}","qq":114514}`],
      ['mode', 'exact'],
      ['joint', 'and'],
      ['isCaseSensitive', 'true'],
    ]);

    expect(headers.get('total-number')).toEqual('1');
  });

  it.each([
    ['customData.qq', '114514'],
    ['customData[qq]', '114514'],
    ['mode.customData', 'exact'],
    ['search.customData', '114514'],
  ])('should reject the nested %s syntax', async (key, value) => {
    await expectRejects(getUsers<User[]>([[key, value]]), {
      code: 'request.invalid_input',
      status: 400,
      messageIncludes: 'Nested `customData` parameters are not supported',
    });
  });

  it.each([
    ['invalid JSON', 'not-json'],
    ['a top-level array', '[]'],
    ['a top-level scalar', '114514'],
    ['an empty object', '{}'],
    ['an empty nested object', '{"profile":{}}'],
    ['an empty nested array', '{"profile":[]}'],
  ])('should reject %s in customData', async (_, value) => {
    await expectRejects(getUsers<User[]>([['customData', value]]), {
      code: 'request.invalid_input',
      status: 400,
    });
  });

  it('should reject more than 20 customData values', async () => {
    await expectRejects(
      getUsers<User[]>(
        Array.from({ length: 21 }, () => ['customData', `{"group":"${userPrefix}"}`])
      ),
      {
        code: 'request.invalid_input',
        status: 400,
        messageIncludes: 'can be repeated at most 20 times',
      }
    );
  });

  it.each([
    ['a number that overflows the numeric format', '{"qq":1e999999}'],
    ['a NUL escape', '{"qq":"\\u0000"}'],
  ])('should reject %s in customData', async (_, value) => {
    await expectRejects(getUsers<User[]>([['customData', value]]), {
      code: 'request.invalid_input',
      status: 400,
    });
  });
});
