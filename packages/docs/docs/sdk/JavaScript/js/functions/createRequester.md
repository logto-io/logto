**createRequester**(`fetchFunction?`): <T\>(...`args`: [input: RequestInfo, init?: RequestInit]) => `Promise`<`T`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `fetchFunction?` | (`input`: `RequestInfo`, `init?`: `RequestInit`) => `Promise`<`Response`\> |

#### Returns

`fn`

<`T`\>(...`args`): `Promise`<`T`\>

##### Type parameters

| Name |
| :------ |
| `T` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [input: RequestInfo, init?: RequestInit] |

##### Returns

`Promise`<`T`\>

#### Defined in

[packages/js/src/utils/requester.ts:10](https://github.com/logto-io/js/blob/5254dee/packages/js/src/utils/requester.ts#L10)
