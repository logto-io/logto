# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.2](https://github.com/logto-io/logto/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-07-25)


### Features

* **core:** api GET /me ([#1650](https://github.com/logto-io/logto/issues/1650)) ([4bf6483](https://github.com/logto-io/logto/commit/4bf6483ff4674052d4b5d00d647c0c408b3ecc7f))
* **core:** refresh token rotation reuse interval ([#1617](https://github.com/logto-io/logto/issues/1617)) ([bb245ad](https://github.com/logto-io/logto/commit/bb245adbb917dd066db2fe9cfbdbe102394e2c0e))
* **core:** support integration test env config ([#1619](https://github.com/logto-io/logto/issues/1619)) ([708523e](https://github.com/logto-io/logto/commit/708523ed5287683cc23c6a93e01fe55dbd838e8c))


### Bug Fixes

* **core:** resolve some core no-restricted-syntax lint error ([#1606](https://github.com/logto-io/logto/issues/1606)) ([c56ddec](https://github.com/logto-io/logto/commit/c56ddec84ade4da1385d9821a1149375a70167dd))
* **deps:** update dependency koa-router to v12 ([#1596](https://github.com/logto-io/logto/issues/1596)) ([6e96d73](https://github.com/logto-io/logto/commit/6e96d73a7c187c5dd25a7977654387ad2f33f3b2))



## [1.0.0-beta.1](https://github.com/logto-io/logto/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-19)


### Features

* **core:** add response guard ([#1542](https://github.com/logto-io/logto/issues/1542)) ([6c39790](https://github.com/logto-io/logto/commit/6c397901805b01613df71eecaa06d3d84d0b606a))



## [1.0.0-beta.0](https://github.com/logto-io/logto/compare/v1.0.0-alpha.4...v1.0.0-beta.0) (2022-07-14)


### Features

* **core:** add admin guard to signin ([#1523](https://github.com/logto-io/logto/issues/1523)) ([3e76de0](https://github.com/logto-io/logto/commit/3e76de0ac9ed1be5ad3903fc1c3863673014d9c2))
* **core:** read connector packages env ([#1478](https://github.com/logto-io/logto/issues/1478)) ([adadcbe](https://github.com/logto-io/logto/commit/adadcbe21619da325673ef3f96f1ddc1a073540d))


### Bug Fixes

* **connector:** fix connector getConfig and validateConfig type ([#1530](https://github.com/logto-io/logto/issues/1530)) ([88a54aa](https://github.com/logto-io/logto/commit/88a54aaa9ebce419c149a33150a4927296cb705b))
* **connector:** passwordless connector send test msg with unsaved config ([#1539](https://github.com/logto-io/logto/issues/1539)) ([0297f6c](https://github.com/logto-io/logto/commit/0297f6c52f7b5d730de44fbb08f88c2e9b951874))
* **connector:** refactor ConnectorInstance as class ([#1541](https://github.com/logto-io/logto/issues/1541)) ([6b9ad58](https://github.com/logto-io/logto/commit/6b9ad580ae86fbcc100a100aab1d834090e682a3))
* **ui,core:** fix i18n issue ([#1548](https://github.com/logto-io/logto/issues/1548)) ([6b58d8a](https://github.com/logto-io/logto/commit/6b58d8a1610b1b75155d873e8898786d2b723ec6))



## [1.0.0-alpha.4](https://github.com/logto-io/logto/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2022-07-08)


### Features

* **connector:** connector error handler, throw errmsg on general errors ([#1458](https://github.com/logto-io/logto/issues/1458)) ([7da1de3](https://github.com/logto-io/logto/commit/7da1de33e97de4aeeec9f9b6cea59d1bf90ba623))
* expose zod error ([#1474](https://github.com/logto-io/logto/issues/1474)) ([81b63f0](https://github.com/logto-io/logto/commit/81b63f07bb412abf1f2b42059bac2ffcfc86272c))


### Bug Fixes

* **core:** add session check ([#1453](https://github.com/logto-io/logto/issues/1453)) ([78e06d5](https://github.com/logto-io/logto/commit/78e06d5c7f458d9174f4d057ba83f738717510f5))



## [1.0.0-alpha.3](https://github.com/logto-io/logto/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-07)


### Features

* **core:** append additional yaml responses to swagger.json ([#1407](https://github.com/logto-io/logto/issues/1407)) ([100bffb](https://github.com/logto-io/logto/commit/100bffbc6aa51478bda432ba01491a708bdcd172))


### Bug Fixes

* **core,ui:** remove todo comments ([#1454](https://github.com/logto-io/logto/issues/1454)) ([d5d6c5e](https://github.com/logto-io/logto/commit/d5d6c5ed083364dabaa0220deaa6a22e0350d146))
* **deps:** update dependency koa-router to v11 ([#1406](https://github.com/logto-io/logto/issues/1406)) ([ff6f223](https://github.com/logto-io/logto/commit/ff6f2235eaa2a146f11de9299e38fb1b7fae9bc6))



## [1.0.0-alpha.2](https://github.com/logto-io/logto/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-07-07)

**Note:** Version bump only for package @logto/core





## [1.0.0-alpha.1](https://github.com/logto-io/logto/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-05)


### Bug Fixes

* **core:** do not titlize tags of .well-known APIs ([#1412](https://github.com/logto-io/logto/issues/1412)) ([5559fb1](https://github.com/logto-io/logto/commit/5559fb10c33932300d9f863cb3f57c48c504acdc))



## [1.0.0-alpha.0](https://github.com/logto-io/logto/compare/v0.1.2-alpha.5...v1.0.0-alpha.0) (2022-07-04)

**Note:** Version bump only for package @logto/core





### [0.1.2-alpha.5](https://github.com/logto-io/logto/compare/v0.1.2-alpha.4...v0.1.2-alpha.5) (2022-07-03)

**Note:** Version bump only for package @logto/core





### [0.1.2-alpha.4](https://github.com/logto-io/logto/compare/v0.1.2-alpha.3...v0.1.2-alpha.4) (2022-07-03)

**Note:** Version bump only for package @logto/core





### [0.1.2-alpha.3](https://github.com/logto-io/logto/compare/v0.1.2-alpha.2...v0.1.2-alpha.3) (2022-07-03)


### Features

* **core:** auto sign-out ([#1369](https://github.com/logto-io/logto/issues/1369)) ([6c32340](https://github.com/logto-io/logto/commit/6c323403b391ac09100aad87e7c9f59b588bdd45))



### [0.1.2-alpha.2](https://github.com/logto-io/logto/compare/v0.1.2-alpha.1...v0.1.2-alpha.2) (2022-07-02)

**Note:** Version bump only for package @logto/core





### [0.1.2-alpha.1](https://github.com/logto-io/logto/compare/v0.1.2-alpha.0...v0.1.2-alpha.1) (2022-07-02)

**Note:** Version bump only for package @logto/core





### [0.1.2-alpha.0](https://github.com/logto-io/logto/compare/v0.1.1-alpha.0...v0.1.2-alpha.0) (2022-07-02)

**Note:** Version bump only for package @logto/core





### [0.1.1-alpha.0](https://github.com/logto-io/logto/compare/v0.1.0-internal...v0.1.1-alpha.0) (2022-07-01)


### Features

* **ac:** implement admin console welcome page ([#1139](https://github.com/logto-io/logto/issues/1139)) ([b42f4ba](https://github.com/logto-io/logto/commit/b42f4ba1ff11c769efece9f5cea75014924516fc))
* **connector-alipay-native:** add Alipay Native connector ([#873](https://github.com/logto-io/logto/issues/873)) ([9589aea](https://github.com/logto-io/logto/commit/9589aeafec8592531aa1dfe598ca6cec7325eded))
* **connector-sendgrid-email:** add sendgrid email connector ([#850](https://github.com/logto-io/logto/issues/850)) ([b887655](https://github.com/logto-io/logto/commit/b8876558275e28ca921d4eeea6c38f8559810a11))
* **connector-twilio-sms:** add twilio sms connector ([#881](https://github.com/logto-io/logto/issues/881)) ([d7ce13d](https://github.com/logto-io/logto/commit/d7ce13d260ec79e0c0f68bf3068cb9c79adf5273))
* **connector:** apple ([#966](https://github.com/logto-io/logto/issues/966)) ([7400ed8](https://github.com/logto-io/logto/commit/7400ed8896fdceda6165a0540413efb4e3a47438))
* **connectors:** handle authorization callback parameters in each connector respectively ([#1166](https://github.com/logto-io/logto/issues/1166)) ([097aade](https://github.com/logto-io/logto/commit/097aade2e2e1b1ea1531bcb4c1cca8d24961a9b9))
* **console,core:** hide admin user ([#1182](https://github.com/logto-io/logto/issues/1182)) ([9194a6e](https://github.com/logto-io/logto/commit/9194a6ee547e2eb83ec106a834409c33644481e5))
* **console:** add column lastSignIn in user management ([#679](https://github.com/logto-io/logto/issues/679)) ([a0b4b98](https://github.com/logto-io/logto/commit/a0b4b98c35ff08c2df0863e4bc2110386fc54aee))
* **console:** dark logo ([#860](https://github.com/logto-io/logto/issues/860)) ([664a218](https://github.com/logto-io/logto/commit/664a2180a51b577fb517661cf0d7efb1374f3858))
* **console:** sie form reorg ([#1218](https://github.com/logto-io/logto/issues/1218)) ([2c41334](https://github.com/logto-io/logto/commit/2c413341d1c515049faa130416f7a5e591d10e8a))
* **console:** support persisting get-started progress in settings config ([43b2309](https://github.com/logto-io/logto/commit/43b2309c994b2eb8b1b8f1c12893eb66b5ce1d95))
* **core,connectors:** update Aliyun logo and add logo_dark to Apple, Github ([#1194](https://github.com/logto-io/logto/issues/1194)) ([98f8083](https://github.com/logto-io/logto/commit/98f808320b1c79c51f8bd6f49e35ca44363ea560))
* **core,console:** change admin user password ([#1268](https://github.com/logto-io/logto/issues/1268)) ([a4d0a94](https://github.com/logto-io/logto/commit/a4d0a940bdabb213866407afb6c064b6740ce593))
* **core,console:** connector platform tabs ([#887](https://github.com/logto-io/logto/issues/887)) ([65fb36c](https://github.com/logto-io/logto/commit/65fb36ce3fd021cd44aeff95c4a01e75fe1352e7))
* **core,console:** social connector targets ([#851](https://github.com/logto-io/logto/issues/851)) ([127664a](https://github.com/logto-io/logto/commit/127664a62f1b1c794569b7fe9d0bfceb7b97dc74))
* **core,schemas:** koaLogSession middleware ([#767](https://github.com/logto-io/logto/issues/767)) ([4e60446](https://github.com/logto-io/logto/commit/4e6044641190faaa2ee4f8d4765118e381df8a30))
* **core,schemas:** log IP and user agent ([#682](https://github.com/logto-io/logto/issues/682)) ([0ecb7e4](https://github.com/logto-io/logto/commit/0ecb7e4d2fe869ada46cc39e0fef98d2240cb1b2))
* **core,schemas:** log token exchange success ([#809](https://github.com/logto-io/logto/issues/809)) ([3b048a8](https://github.com/logto-io/logto/commit/3b048a80a374ff720a5afe3b35f007b31fddd576))
* **core,schemas:** save application id that the user first consented ([#688](https://github.com/logto-io/logto/issues/688)) ([4521c3c](https://github.com/logto-io/logto/commit/4521c3c8d17becb6b322fc0128fff992f34d2a0d))
* **core,shared:** get /dashboard/users/active ([#953](https://github.com/logto-io/logto/issues/953)) ([1420bb2](https://github.com/logto-io/logto/commit/1420bb28cec9c0e20b4d0645a58e436135f87c83))
* **core:** add admin role validation to the koaAuth ([#920](https://github.com/logto-io/logto/issues/920)) ([cf360b9](https://github.com/logto-io/logto/commit/cf360b9c15594b0923c79adf3a401e29d84fad23))
* **core:** add custom claims to id token ([#911](https://github.com/logto-io/logto/issues/911)) ([9ccda93](https://github.com/logto-io/logto/commit/9ccda932a45816be2089d3e58c8e91f55b9ecce9))
* **core:** add etag for settings api ([#1011](https://github.com/logto-io/logto/issues/1011)) ([d4f38bc](https://github.com/logto-io/logto/commit/d4f38bce2b016ddd4e6d5f260e04c7e0f4f312f7))
* **core:** add phone number and email mask ([#891](https://github.com/logto-io/logto/issues/891)) ([67f080e](https://github.com/logto-io/logto/commit/67f080e8623de0417436f9897f1179e6cdc62130))
* **core:** add role table seed  ([#1145](https://github.com/logto-io/logto/issues/1145)) ([837ad52](https://github.com/logto-io/logto/commit/837ad523cef4a41ab9fdddfe7a92b6ed074114a0))
* **core:** add sign-in-mode ([#1132](https://github.com/logto-io/logto/issues/1132)) ([f640dad](https://github.com/logto-io/logto/commit/f640dad52f2e75620b392114673860138e1aca2c))
* **core:** add smtp connector ([#1131](https://github.com/logto-io/logto/issues/1131)) ([f8710e1](https://github.com/logto-io/logto/commit/f8710e147d1299a53598e68188044a5f25caf2e3))
* **core:** add socialConnectors details for get sign-in-settings ([#804](https://github.com/logto-io/logto/issues/804)) ([7a922cb](https://github.com/logto-io/logto/commit/7a922cbd331b45443f7f19a8af3dcd9156453079))
* **core:** add switch of enabling object fully replace when updating DB ([#1107](https://github.com/logto-io/logto/issues/1107)) ([efa9491](https://github.com/logto-io/logto/commit/efa9491749f6702ba0d15ab50818e8a9622fdd90))
* **core:** add welcome route ([#1080](https://github.com/logto-io/logto/issues/1080)) ([f6f562a](https://github.com/logto-io/logto/commit/f6f562a8ba2c67793246eded995285eb5b68c1c7))
* **core:** align connector error handler middleware with ConnectorErrorCodes ([#1063](https://github.com/logto-io/logto/issues/1063)) ([1b8190a](https://github.com/logto-io/logto/commit/1b8190addfd33bf9a317f991023984a2efdb6796))
* **core:** any-type parameter shows empty object in swagger example ([#1110](https://github.com/logto-io/logto/issues/1110)) ([7339a85](https://github.com/logto-io/logto/commit/7339a85a1bb4f1a8c69a05fb5bfd61f154b24eb7))
* **core:** append page and page_size to the query parameters in swagger.json ([#1120](https://github.com/logto-io/logto/issues/1120)) ([a262999](https://github.com/logto-io/logto/commit/a26299941f71fd6cae51380c05a9e49f4fae2084))
* **core:** convert route guards to swagger.json ([#1047](https://github.com/logto-io/logto/issues/1047)) ([3145c9b](https://github.com/logto-io/logto/commit/3145c9b34824e9107a98625dc2998f605a936ae8))
* **core:** convert Zod union, literal and string guards to OpenAPI schemas ([#1126](https://github.com/logto-io/logto/issues/1126)) ([511012d](https://github.com/logto-io/logto/commit/511012da92bf1cae9e8429b343f4554b8c4230f0))
* **core:** cookie keys configuration ([#902](https://github.com/logto-io/logto/issues/902)) ([17c63cd](https://github.com/logto-io/logto/commit/17c63cd2d9fe5f3f66fe2404a7358f0d8524e667))
* **core:** dau curve contains 0 count points ([#1105](https://github.com/logto-io/logto/issues/1105)) ([75ac874](https://github.com/logto-io/logto/commit/75ac874a2d02e308d6a63f4925e3f9b2c3377b8d))
* **core:** disable introspection feature ([#886](https://github.com/logto-io/logto/issues/886)) ([b2ac2c1](https://github.com/logto-io/logto/commit/b2ac2c14eead0fba45dec90115f75dd2074e04ee))
* **core:** empty path sould redirect to the console page ([#915](https://github.com/logto-io/logto/issues/915)) ([207c404](https://github.com/logto-io/logto/commit/207c404aebd062f2f46742748ed08c5d97368dbc))
* **core:** expose connector and metadata from sendPasscode ([#806](https://github.com/logto-io/logto/issues/806)) ([0ea5513](https://github.com/logto-io/logto/commit/0ea55134a92252a00f6b3532cdde71ae96979452))
* **core:** fix connectors' initialization ([c6f2546](https://github.com/logto-io/logto/commit/c6f2546126ec48da0ef28f939a062c844c03b2b7))
* **core:** get /dashboard/users/new ([#940](https://github.com/logto-io/logto/issues/940)) ([45a9777](https://github.com/logto-io/logto/commit/45a977790eca01b212f51047d5636ff882873dd8))
* **core:** get /dashboard/users/total ([#936](https://github.com/logto-io/logto/issues/936)) ([c4bb0de](https://github.com/logto-io/logto/commit/c4bb0de7d426055b3634d8e4dace5cface7f2f0f))
* **core:** get /logs ([#823](https://github.com/logto-io/logto/issues/823)) ([4ffd4c0](https://github.com/logto-io/logto/commit/4ffd4c048028567f701e5a3d6a507907b63a0151))
* **core:** get /logs/:id ([#934](https://github.com/logto-io/logto/issues/934)) ([bddf47b](https://github.com/logto-io/logto/commit/bddf47bf90213397688f3566f0018029e5959709))
* **core:** grantErrorListener for logging token exchange error ([#894](https://github.com/logto-io/logto/issues/894)) ([797344f](https://github.com/logto-io/logto/commit/797344f6f5e3b64e1d8861eeeac0d18cb59032f2))
* **core:** grantRevokedListener for logging revocation of access and refresh token ([#900](https://github.com/logto-io/logto/issues/900)) ([e5196fc](https://github.com/logto-io/logto/commit/e5196fc31dc1c4ec8086c9df2d1cc8f5486af380))
* **core:** identities key should use target not connectorId ([#1115](https://github.com/logto-io/logto/issues/1115)) ([41e37a7](https://github.com/logto-io/logto/commit/41e37a79955ac4f6437c4e52c1cf3f74adaad811)), closes [#1134](https://github.com/logto-io/logto/issues/1134)
* **core:** log error body ([#1065](https://github.com/logto-io/logto/issues/1065)) ([2ba1121](https://github.com/logto-io/logto/commit/2ba11215edc8bc83efcd41e1587b53fddc5bb101))
* **core:** log sending passcode with connector id ([#824](https://github.com/logto-io/logto/issues/824)) ([82c7138](https://github.com/logto-io/logto/commit/82c7138683f1027a227b3939d7516e0912773fe5))
* **core:** make GET /api/swagger.json contain all api routes ([#1008](https://github.com/logto-io/logto/issues/1008)) ([8af2f95](https://github.com/logto-io/logto/commit/8af2f953cf826cc5c72c0b7a0ae30d50b8caa6d9))
* **core:** order logs by created_at desc ([#993](https://github.com/logto-io/logto/issues/993)) ([2ae4e2e](https://github.com/logto-io/logto/commit/2ae4e2eccfd3699516d4d192f42607fea2b56623))
* **core:** register with admin role ([#1140](https://github.com/logto-io/logto/issues/1140)) ([4f32ad3](https://github.com/logto-io/logto/commit/4f32ad3a511985b1ccb8706cff3b604c86a7d50b))
* **core:** remove code redundancy ([d989785](https://github.com/logto-io/logto/commit/d98978565864852b4885ecf5f4d2fb1fa807601c))
* **core:** remove unnecessary variable check and unused route ([#1084](https://github.com/logto-io/logto/issues/1084)) ([bcc05e5](https://github.com/logto-io/logto/commit/bcc05e521d3b0017421b7a3ae30a7e5e2b015b87))
* **core:** separate social sign-in api ([#735](https://github.com/logto-io/logto/issues/735)) ([e71cf7e](https://github.com/logto-io/logto/commit/e71cf7ea67dbd22eac6a3aa12aa20687c00aa7e6))
* **core:** serve connector logo ([#931](https://github.com/logto-io/logto/issues/931)) ([5b44b71](https://github.com/logto-io/logto/commit/5b44b7194ed4f98c6c2e77aae828a39b477b6010))
* **core:** set claims for `profile` scope ([#1013](https://github.com/logto-io/logto/issues/1013)) ([7781d49](https://github.com/logto-io/logto/commit/7781d496676cc233b4d62214fa11e9fdfda21929))
* **core:** update connector db schema ([#732](https://github.com/logto-io/logto/issues/732)) ([8e1533a](https://github.com/logto-io/logto/commit/8e1533a70267d459feea4e5174296b17bef84d48))
* **demo-app:** implementation ([#982](https://github.com/logto-io/logto/issues/982)) ([7f4f4f8](https://github.com/logto-io/logto/commit/7f4f4f84addf8a25c3d30f1ac3ceeef460afcf17))
* **demo-app:** implementation (3/3) ([#1021](https://github.com/logto-io/logto/issues/1021)) ([91e2f05](https://github.com/logto-io/logto/commit/91e2f055f2eb75ef8846b02d0d211adbbb898b41))
* **native-connectors:** pass random state to native connector sdk ([#922](https://github.com/logto-io/logto/issues/922)) ([9679620](https://github.com/logto-io/logto/commit/96796203dd4247d7ecdee044f13f3d57f04ca461))
* remove target, platform from connector schema and add id to metadata ([#930](https://github.com/logto-io/logto/issues/930)) ([054b0f7](https://github.com/logto-io/logto/commit/054b0f7b6a6dfed66540042ea69b0721126fe695))
* update field check rules ([#854](https://github.com/logto-io/logto/issues/854)) ([85a407c](https://github.com/logto-io/logto/commit/85a407c5f6f76fed0513acd6fb41943413935b5a))
* use user level custom data to save preferences ([#1045](https://github.com/logto-io/logto/issues/1045)) ([f2b44b4](https://github.com/logto-io/logto/commit/f2b44b49f9763b365b0062000146fee2b8df72a9))


### Bug Fixes

* `lint:report` script ([#730](https://github.com/logto-io/logto/issues/730)) ([3b17324](https://github.com/logto-io/logto/commit/3b17324d189b2fe47985d0bee8b37b4ef1dbdd2b))
* **connector-wechat-native:** fix wechat-native target ([#820](https://github.com/logto-io/logto/issues/820)) ([ab6c124](https://github.com/logto-io/logto/commit/ab6c1246207fd191b1db27d172500a5e7a2d8050))
* connectors platform ([#925](https://github.com/logto-io/logto/issues/925)) ([16ec018](https://github.com/logto-io/logto/commit/16ec018b711baeec28a22a7780370044c230bd24))
* **console,core:** only show enabled connectors in sign in methods ([#988](https://github.com/logto-io/logto/issues/988)) ([4768181](https://github.com/logto-io/logto/commit/4768181bf77261eb84a1c4cb903fa0a22765d837))
* **console:** update terms of use ([#1122](https://github.com/logto-io/logto/issues/1122)) ([9262a6f](https://github.com/logto-io/logto/commit/9262a6f3beb7c2c46708453ce7d667dc5b39da8e))
* **console:** update user data ([#1184](https://github.com/logto-io/logto/issues/1184)) ([a3d3a79](https://github.com/logto-io/logto/commit/a3d3a79dd9c93c2bd23af78da1eb45de81642c3f))
* **core,console:** delete specific user identities by target ([#1176](https://github.com/logto-io/logto/issues/1176)) ([ad86bc8](https://github.com/logto-io/logto/commit/ad86bc8e120e571268cffbb45fe3c8253c1207fe))
* **core:** align jsonb replace mode ([#1138](https://github.com/logto-io/logto/issues/1138)) ([3cf34b5](https://github.com/logto-io/logto/commit/3cf34b59112a2d20cdc1f1dfc0d2802a27c886c2))
* **core:** allow empty condition in logs ([#991](https://github.com/logto-io/logto/issues/991)) ([2819859](https://github.com/logto-io/logto/commit/28198590faa16b010dfb8050738a1f9a60f26bd9))
* **core:** catch interaction not found error ([#827](https://github.com/logto-io/logto/issues/827)) ([38ceae7](https://github.com/logto-io/logto/commit/38ceae78536fadabd1abfb845c3172908d4662b4))
* **core:** disabled session check for preview mode ([#867](https://github.com/logto-io/logto/issues/867)) ([82674ee](https://github.com/logto-io/logto/commit/82674eea885e6819213f10833b6a5a66dec9f6ac))
* **core:** fix connector readme and configTemplate content parsing ([#1267](https://github.com/logto-io/logto/issues/1267)) ([05db124](https://github.com/logto-io/logto/commit/05db12492c98c42b760a86a339838ee4b6d5ca6d))
* **core:** fix preview session not found bug ([#970](https://github.com/logto-io/logto/issues/970)) ([545a392](https://github.com/logto-io/logto/commit/545a3929e4e0bd8853c142ec5ca27520ba428da1))
* **core:** koaAuth should return 403 instead of 401 on non-admin role ([ee16eeb](https://github.com/logto-io/logto/commit/ee16eeb9662d99d04a8d2c2770f89f0641f1e743))
* **core:** prevent session lost for bind social ([#948](https://github.com/logto-io/logto/issues/948)) ([077ed12](https://github.com/logto-io/logto/commit/077ed120f09cdfdb81e95cbb434488569f87bfd1))
* **core:** remove ESM declaration ([#687](https://github.com/logto-io/logto/issues/687)) ([e61dba9](https://github.com/logto-io/logto/commit/e61dba90a815f8bd2ab72861c7e8bcefcfcc4b0d))
* **core:** remove name regex ([#1109](https://github.com/logto-io/logto/issues/1109)) ([a790248](https://github.com/logto-io/logto/commit/a790248c091e444614652b08b05686e9934cb639))
* **core:** remove unavailable social sign in targets on save ([#1201](https://github.com/logto-io/logto/issues/1201)) ([012562e](https://github.com/logto-io/logto/commit/012562e2a8226525b4d4b8c80eb092b1780e0221))
* **core:** revert add custom claims to id token ([#919](https://github.com/logto-io/logto/issues/919)) ([fe99928](https://github.com/logto-io/logto/commit/fe99928a41e1987f7fd078b711c9a0bb2c86e5c9))
* **core:** set module in base config ([#685](https://github.com/logto-io/logto/issues/685)) ([d108f4b](https://github.com/logto-io/logto/commit/d108f4b8833ea86ccfe74b2165e844493f738da4))
* **core:** settings api should not throw session not found error ([#1157](https://github.com/logto-io/logto/issues/1157)) ([e0793fa](https://github.com/logto-io/logto/commit/e0793facb92d0b10a0c52e3346f4fd4ad81662cd))
* **core:** signing in with a non-existing username should throw invalid credentials ([#1239](https://github.com/logto-io/logto/issues/1239)) ([53781d6](https://github.com/logto-io/logto/commit/53781d619dedc4e51d87d4ad917d0dbfcc1510d9))
* **core:** social user info in session ([#794](https://github.com/logto-io/logto/issues/794)) ([74f2940](https://github.com/logto-io/logto/commit/74f2940398ecdfe00f0d8306f01451d859cff186))
* **core:** update proxy guard middleware ([#963](https://github.com/logto-io/logto/issues/963)) ([909535f](https://github.com/logto-io/logto/commit/909535f4af95b40ac8714a92afb5cbd48f4fa47b))
* **core:** update role names ([#913](https://github.com/logto-io/logto/issues/913)) ([d659995](https://github.com/logto-io/logto/commit/d65999514f9d3d516bc18e1e0396eff8b42daa50))
* **core:** update roleNames to role_names to resolve 401 errors ([5a1fa14](https://github.com/logto-io/logto/commit/5a1fa14a981cba0fa7314941902a8d017fad42f3))
* **core:** update timestamp field with millisecond precision ([#677](https://github.com/logto-io/logto/issues/677)) ([7278ba4](https://github.com/logto-io/logto/commit/7278ba40958ca57468e562a6978c25e6c993dd20))
* delete custom domain ([#737](https://github.com/logto-io/logto/issues/737)) ([8a48fb6](https://github.com/logto-io/logto/commit/8a48fb6225f9850aeec7917a54d849fd9a88254e))
* **ui:** fix sign-in not found bug ([#841](https://github.com/logto-io/logto/issues/841)) ([5d34442](https://github.com/logto-io/logto/commit/5d34442018d0577ff3f90d57008d2af5d4f5b54b))
