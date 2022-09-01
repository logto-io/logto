# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.8](https://github.com/logto-io/logto/compare/v1.0.0-beta.6...v1.0.0-beta.8) (2022-09-01)


### Features

* **connector:** add kakao connector ([#1826](https://github.com/logto-io/logto/issues/1826)) ([1f9e820](https://github.com/logto-io/logto/commit/1f9e820eb60d0034b82099fe5a9c96457e47101e))



## [1.0.0-beta.6](https://github.com/logto-io/logto/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-08-30)


### Features

* **console:** allow to disable create account ([#1806](https://github.com/logto-io/logto/issues/1806)) ([67305ec](https://github.com/logto-io/logto/commit/67305ec407d8a5ea1956e37df6dae2bdff012c06))
* **console:** express integration guide ([#1807](https://github.com/logto-io/logto/issues/1807)) ([8e4ef2f](https://github.com/logto-io/logto/commit/8e4ef2ff25641d377cca9d0a2e16791dff8aee22))
* **core:** guard session with sign-in mode ([a8a3de3](https://github.com/logto-io/logto/commit/a8a3de35443cec485a435d51b452af0f9a56ed28))


### Bug Fixes

* **console:** change step title to sentence case ([#1814](https://github.com/logto-io/logto/issues/1814)) ([82cd315](https://github.com/logto-io/logto/commit/82cd31545d0485ac59857904aa681c4a15eace38))



## [1.0.0-beta.5](https://github.com/logto-io/logto/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-08-19)


### ⚠ BREAKING CHANGES

* **core,console:** remove `/me` apis (#1781)

### Features

* **core:** enable userinfo endpoint ([#1783](https://github.com/logto-io/logto/issues/1783)) ([a6bb2f7](https://github.com/logto-io/logto/commit/a6bb2f7ec239cf036c740fbee79c20c73cf6d694))
* **core:** hasura authn ([#1790](https://github.com/logto-io/logto/issues/1790)) ([87d3a53](https://github.com/logto-io/logto/commit/87d3a53b65ad18be337fffd78aaecd3483c8f33b))
* **core:** set user default roles from env ([#1793](https://github.com/logto-io/logto/issues/1793)) ([4afdf3c](https://github.com/logto-io/logto/commit/4afdf3cb4c868cc85ba1d6b155165515a431d771))
* **phrases:** add french language ([#1767](https://github.com/logto-io/logto/issues/1767)) ([0503b30](https://github.com/logto-io/logto/commit/0503b30121b724040b0b052a031c680b8853b25c))


### Bug Fixes

* **console:** show platform icons in connector table ([#1792](https://github.com/logto-io/logto/issues/1792)) ([31f2439](https://github.com/logto-io/logto/commit/31f243957c83004dbc8578ab8931a2bc10c537b4))
* **core:** fix ac & ui proxy under subpath deployment ([#1761](https://github.com/logto-io/logto/issues/1761)) ([163c23b](https://github.com/logto-io/logto/commit/163c23b9bd3019e1187de9dec1a2fdd2201630f7))
* **deps:** update dependency slonik to v30 ([#1744](https://github.com/logto-io/logto/issues/1744)) ([a9f99db](https://github.com/logto-io/logto/commit/a9f99db54e8b6e8c951832d800a1eedc311234c2))


### Code Refactoring

* **core,console:** remove `/me` apis ([#1781](https://github.com/logto-io/logto/issues/1781)) ([2c6171c](https://github.com/logto-io/logto/commit/2c6171c2f97b5122c13dd959f507399b9a9d6aa4))



## [1.0.0-beta.4](https://github.com/logto-io/logto/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-08-11)


### ⚠ BREAKING CHANGES

* **core:** use comma separated values as a string array in the env file (#1762)

### Features

* **console:** add app secret to guide ([#1735](https://github.com/logto-io/logto/issues/1735)) ([380e258](https://github.com/logto-io/logto/commit/380e2581fa5fdd2a8d4c76f45cd114b1ddea9891))
* **console:** show app secret ([#1723](https://github.com/logto-io/logto/issues/1723)) ([01dfeed](https://github.com/logto-io/logto/commit/01dfeed19b05219c1ab52790b3e98a029af02f90))
* **core,schemas:** add application secret ([#1715](https://github.com/logto-io/logto/issues/1715)) ([543ee04](https://github.com/logto-io/logto/commit/543ee04f53f81b41b0669f0ac5773fc67d500c0c))
* **core:** support signing key rotation ([#1732](https://github.com/logto-io/logto/issues/1732)) ([00bab4c](https://github.com/logto-io/logto/commit/00bab4c09582797c31d9bc5c7fe6d3c4b44a2f36))
* **core:** use comma separated values as a string array in the env file ([#1762](https://github.com/logto-io/logto/issues/1762)) ([f6db981](https://github.com/logto-io/logto/commit/f6db981600fd16a860262336ad88d886ca502628))
* **schemas:** guard string max length ([#1737](https://github.com/logto-io/logto/issues/1737)) ([cdf210d](https://github.com/logto-io/logto/commit/cdf210df100c4105eb095f693b7cb31a005d62b8))


### Bug Fixes

* build and types ([8b51543](https://github.com/logto-io/logto/commit/8b515435cdb0644d0ca19e2c26ba3e744355bb0b))
* **deps:** update dependency slonik to v29 ([#1700](https://github.com/logto-io/logto/issues/1700)) ([21a0c8f](https://github.com/logto-io/logto/commit/21a0c8f635cd561417dd23bca1d899771da6321a))
* **shared:** fix dark color generator ([#1719](https://github.com/logto-io/logto/issues/1719)) ([3deb98c](https://github.com/logto-io/logto/commit/3deb98c18dfe54abda53e6de7592f40924e1f2f3))
* **ui,console,demo-app:** update react render method ([#1750](https://github.com/logto-io/logto/issues/1750)) ([4b972f2](https://github.com/logto-io/logto/commit/4b972f2e23e2d4609d9955c4d1d42972f368f5b9))
* **ui:** add sandbox props to iframe ([#1757](https://github.com/logto-io/logto/issues/1757)) ([62d2afe](https://github.com/logto-io/logto/commit/62d2afe9579334547b7ff5b803299b89933a5bd8))
* **ui:** connector name  should fallback to en ([#1718](https://github.com/logto-io/logto/issues/1718)) ([3af5b1b](https://github.com/logto-io/logto/commit/3af5b1b4250d6de6883b4c8a8b9f7cf4f9b12dab))
* **ui:** extract ReactModal elementApp and fix act warning in ut ([#1756](https://github.com/logto-io/logto/issues/1756)) ([0270bf1](https://github.com/logto-io/logto/commit/0270bf1be3a51d9b9f8ed84a0327c58ed8a1bd4d))
* **ui:** fix ui test ([e4629f2](https://github.com/logto-io/logto/commit/e4629f2a5fd26a1d8eaefd04042eaeb5563ec30c))



## [1.0.0-beta.3](https://github.com/logto-io/logto/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-01)


### Features

* **connector:** azure active directory connector added ([#1662](https://github.com/logto-io/logto/issues/1662)) ([875a828](https://github.com/logto-io/logto/commit/875a82883161b79b11873bcfce2856e7b84502b4))
* **console:** add Next.js integration guide in admin console ([7d3f947](https://github.com/logto-io/logto/commit/7d3f94738f495de98464d23b6fdf18214d59005e))
* **console:** checked if sign in method is primary ([#1706](https://github.com/logto-io/logto/issues/1706)) ([405791f](https://github.com/logto-io/logto/commit/405791f9910ae9f11cf34d346b0b34fcba3a2aad))
* **phrases:** tr language ([#1707](https://github.com/logto-io/logto/issues/1707)) ([411a8c2](https://github.com/logto-io/logto/commit/411a8c2fa2bfb16c4fef5f0a55c3c1dc5ead1124))


### Bug Fixes

* **console:** app error illustration height should not be shrunk ([301cc6c](https://github.com/logto-io/logto/commit/301cc6c51031d4042337583866c7c4814b730809))
* **console:** should not display unsaved changes alert on connector config updated ([#1685](https://github.com/logto-io/logto/issues/1685)) ([61b65a7](https://github.com/logto-io/logto/commit/61b65a7288bcba0a139c917125b58ac3258ef3ad))
* **test:** run integration test serially ([#1676](https://github.com/logto-io/logto/issues/1676)) ([8394f7b](https://github.com/logto-io/logto/commit/8394f7bb2ed5736bb2cd7857edd558602d236c6f))


### Reverts

* Revert "feat(console): checked if sign in method is primary" (#1712) ([2229dce](https://github.com/logto-io/logto/commit/2229dce36ea79bb04cf29c39bdb70b22f1430510)), closes [#1712](https://github.com/logto-io/logto/issues/1712) [#1706](https://github.com/logto-io/logto/issues/1706)



## [1.0.0-beta.2](https://github.com/logto-io/logto/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2022-07-25)


### Features

* **core:** api GET /me ([#1650](https://github.com/logto-io/logto/issues/1650)) ([4bf6483](https://github.com/logto-io/logto/commit/4bf6483ff4674052d4b5d00d647c0c408b3ecc7f))
* **core:** refresh token rotation reuse interval ([#1617](https://github.com/logto-io/logto/issues/1617)) ([bb245ad](https://github.com/logto-io/logto/commit/bb245adbb917dd066db2fe9cfbdbe102394e2c0e))
* **core:** support integration test env config ([#1619](https://github.com/logto-io/logto/issues/1619)) ([708523e](https://github.com/logto-io/logto/commit/708523ed5287683cc23c6a93e01fe55dbd838e8c))


### Bug Fixes

* **console:** code editor content should be editable on firefox ([56ded3e](https://github.com/logto-io/logto/commit/56ded3e0a970bf5d05b675dc7306be22a7e6316c))
* **console:** connector can be dragged upwards to reorder ([038bba4](https://github.com/logto-io/logto/commit/038bba45e198536a00af0e010abd437151c26497))
* **console:** remove annoying horizontal scrollbar from code editor ([7dba908](https://github.com/logto-io/logto/commit/7dba9088492676e9ad257a280d5b615571f36167))
* **console:** should parse to json before using zod safeParse ([ec674ec](https://github.com/logto-io/logto/commit/ec674ecd7745beb3df2b651bfa98d5e8d4a62dfd))
* **core:** resolve some core no-restricted-syntax lint error ([#1606](https://github.com/logto-io/logto/issues/1606)) ([c56ddec](https://github.com/logto-io/logto/commit/c56ddec84ade4da1385d9821a1149375a70167dd))
* **demo-app:** hide username if not exists ([#1644](https://github.com/logto-io/logto/issues/1644)) ([8b30f97](https://github.com/logto-io/logto/commit/8b30f974bfa4fa9c1aa43d2bcc22779a454905db))
* **deps:** update dependency koa-router to v12 ([#1596](https://github.com/logto-io/logto/issues/1596)) ([6e96d73](https://github.com/logto-io/logto/commit/6e96d73a7c187c5dd25a7977654387ad2f33f3b2))
* **test:** use demo app to test username-password flow in integration test ([#1635](https://github.com/logto-io/logto/issues/1635)) ([a258587](https://github.com/logto-io/logto/commit/a258587b4e804615b6a51e336a1af04478d91437))
* **ui:** fix some firefox standout bug ([#1615](https://github.com/logto-io/logto/issues/1615)) ([4ce6bd8](https://github.com/logto-io/logto/commit/4ce6bd8cf5c5953d9f62878ab2ea6ede74f6ca48))
* **ui:** protect window.location xss ([#1639](https://github.com/logto-io/logto/issues/1639)) ([34b465c](https://github.com/logto-io/logto/commit/34b465c7d83999e2215ef83555b64e38778b8b49))
* **ui:** should clear prev passcode input when click on backspace ([#1660](https://github.com/logto-io/logto/issues/1660)) ([7dfbc30](https://github.com/logto-io/logto/commit/7dfbc300b09cc3dac2a06176bf2cbc9f338d857e))



## [1.0.0-beta.1](https://github.com/logto-io/logto/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-19)


### Features

* **console:** add a declaration file for `react-i18next` ([#1556](https://github.com/logto-io/logto/issues/1556)) ([6ae5e7d](https://github.com/logto-io/logto/commit/6ae5e7d9277e5dd77306fa790b95fb61110b7f44))
* **console:** update dashboard chart y-axis tick format ([#1590](https://github.com/logto-io/logto/issues/1590)) ([951c6fa](https://github.com/logto-io/logto/commit/951c6fa9a5499d554141abe55e57f2a9e1943736))
* **core:** add response guard ([#1542](https://github.com/logto-io/logto/issues/1542)) ([6c39790](https://github.com/logto-io/logto/commit/6c397901805b01613df71eecaa06d3d84d0b606a))
* **ui:** add submit input to all the sign-in & register forms ([#1587](https://github.com/logto-io/logto/issues/1587)) ([0c0c83c](https://github.com/logto-io/logto/commit/0c0c83cc8f78f611f5a8527ecedd6ce21d1dad80))


### Bug Fixes

* **console:** docs link doesn't work for en-US locale ([#1594](https://github.com/logto-io/logto/issues/1594)) ([78fcb03](https://github.com/logto-io/logto/commit/78fcb038ed9b4c356774eacc2d23dfd6d71e63ca))
* **console:** external links in readme should be opened in new tab ([23ff0bf](https://github.com/logto-io/logto/commit/23ff0bf21d7ae77b9856d1f2c3e2ad3f2f4baa23))
* **console:** language select box initial value should not be empty ([26f47d8](https://github.com/logto-io/logto/commit/26f47d873ddd259451fd54f9c3bff5dd7cf849d1))
* **console:** navigate to new connector details page after switching connector ([1615e36](https://github.com/logto-io/logto/commit/1615e36f37496acd9c1976aa2f8a3b022cea8fde))
* **ui:** fix no-restrict-syntax in ui ([#1559](https://github.com/logto-io/logto/issues/1559)) ([816ce9f](https://github.com/logto-io/logto/commit/816ce9f903fc939b676165c5ad7e17c72f4c1c86))
* **ui:** format phone number with country calling code ([#1551](https://github.com/logto-io/logto/issues/1551)) ([c6384be](https://github.com/logto-io/logto/commit/c6384bed84340909aaa41f10abaea26b5195e6a5))



## [1.0.0-beta.0](https://github.com/logto-io/logto/compare/v1.0.0-alpha.4...v1.0.0-beta.0) (2022-07-14)


### Features

* **core:** add admin guard to signin ([#1523](https://github.com/logto-io/logto/issues/1523)) ([3e76de0](https://github.com/logto-io/logto/commit/3e76de0ac9ed1be5ad3903fc1c3863673014d9c2))
* **core:** read connector packages env ([#1478](https://github.com/logto-io/logto/issues/1478)) ([adadcbe](https://github.com/logto-io/logto/commit/adadcbe21619da325673ef3f96f1ddc1a073540d))


### Bug Fixes

* **connector:** fix connector getConfig and validateConfig type ([#1530](https://github.com/logto-io/logto/issues/1530)) ([88a54aa](https://github.com/logto-io/logto/commit/88a54aaa9ebce419c149a33150a4927296cb705b))
* **connector:** passwordless connector send test msg with unsaved config ([#1539](https://github.com/logto-io/logto/issues/1539)) ([0297f6c](https://github.com/logto-io/logto/commit/0297f6c52f7b5d730de44fbb08f88c2e9b951874))
* **connector:** refactor ConnectorInstance as class ([#1541](https://github.com/logto-io/logto/issues/1541)) ([6b9ad58](https://github.com/logto-io/logto/commit/6b9ad580ae86fbcc100a100aab1d834090e682a3))
* **console:** markdown toc links that contain special characters should work ([#1543](https://github.com/logto-io/logto/issues/1543)) ([1b056f1](https://github.com/logto-io/logto/commit/1b056f125d5a85275d0a3071d06e31a71c89de78))
* **console:** redirect uri field label should display properly in guide ([#1549](https://github.com/logto-io/logto/issues/1549)) ([020f294](https://github.com/logto-io/logto/commit/020f294067835c333fe8f9dd1aa7e9798d48b731))
* **console:** should display user avatar through google connector ([e2f5263](https://github.com/logto-io/logto/commit/e2f52635c0b9854d4140ecf1df2f0422047790a5))
* **console:** should not display unsaved alert on item deleted ([#1507](https://github.com/logto-io/logto/issues/1507)) ([459af38](https://github.com/logto-io/logto/commit/459af3823c1c5b4ba8cbdc860e1a9fb731975fcc))
* **console:** should not display unsaved alert on settings updated ([#1508](https://github.com/logto-io/logto/issues/1508)) ([5dcdc62](https://github.com/logto-io/logto/commit/5dcdc62f73d9b0ad8e9fcbb3f10aa5816c5bc772))
* **console:** tooltip style ([#1517](https://github.com/logto-io/logto/issues/1517)) ([f387652](https://github.com/logto-io/logto/commit/f387652bfd55a7842ee3c97a3df12f085aaf6013))
* **ui,core:** fix i18n issue ([#1548](https://github.com/logto-io/logto/issues/1548)) ([6b58d8a](https://github.com/logto-io/logto/commit/6b58d8a1610b1b75155d873e8898786d2b723ec6))
* **ui:** fix multiple libphonmenumber packed bug ([#1544](https://github.com/logto-io/logto/issues/1544)) ([e06f8d0](https://github.com/logto-io/logto/commit/e06f8d027eaea3ab89b4fd301be46af3508b61b5))



## [1.0.0-alpha.4](https://github.com/logto-io/logto/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2022-07-08)


### Features

* **connector:** connector error handler, throw errmsg on general errors ([#1458](https://github.com/logto-io/logto/issues/1458)) ([7da1de3](https://github.com/logto-io/logto/commit/7da1de33e97de4aeeec9f9b6cea59d1bf90ba623))
* **console:** add placeholder for connector sender test ([#1476](https://github.com/logto-io/logto/issues/1476)) ([8e85a11](https://github.com/logto-io/logto/commit/8e85a115ec6fa009a53311553a5fc9e9d800c361))
* expose zod error ([#1474](https://github.com/logto-io/logto/issues/1474)) ([81b63f0](https://github.com/logto-io/logto/commit/81b63f07bb412abf1f2b42059bac2ffcfc86272c))


### Bug Fixes

* **console:** add unsaved changes warning in settings page ([2cdbf37](https://github.com/logto-io/logto/commit/2cdbf3774594b3078764bd6b0b837cfcdb081ba3))
* **console:** admin console language detection ([a8f18e5](https://github.com/logto-io/logto/commit/a8f18e53a297303953bf893b1e30f50c4c674b93))
* **console:** connector guide should not have sub title ([#1471](https://github.com/logto-io/logto/issues/1471)) ([8009d9b](https://github.com/logto-io/logto/commit/8009d9bd576ff413ad49833e0c615dd34f5bde85))
* **console:** connector placeholder icon should not have background color ([#1472](https://github.com/logto-io/logto/issues/1472)) ([130817f](https://github.com/logto-io/logto/commit/130817f1012ca21b92e58c49f417f95976f913db))
* **console:** do not show unsaved alert after delete connector ([#1496](https://github.com/logto-io/logto/issues/1496)) ([61a6b1a](https://github.com/logto-io/logto/commit/61a6b1ab4feba88d3175e60d7cf6ba13debe4d5f))
* **console:** docs link in get-started should be localized ([#1482](https://github.com/logto-io/logto/issues/1482)) ([800f047](https://github.com/logto-io/logto/commit/800f04744daec154223f3d94e5d169e2c47bf291))
* **console:** hide demo-app from topbar get-started progress if it is deleted ([b0bdd90](https://github.com/logto-io/logto/commit/b0bdd9027b85bdb00e496e7a139d6c37bb60ae24))
* **console:** hide single platform universal connector tab ([3d944a5](https://github.com/logto-io/logto/commit/3d944a518b1f96753ed5312bfda486a5da814dd2))
* **console:** hide the add connectors hint when no connectors found on sign-in-experience page ([#1473](https://github.com/logto-io/logto/issues/1473)) ([d309400](https://github.com/logto-io/logto/commit/d3094005f12b9a9f3c9e12a6ec06fa60646ffb69))
* **console:** improve error handling in connector details and sender tester ([d9ce4a0](https://github.com/logto-io/logto/commit/d9ce4a01542da0d8ca5fc45a5086314d28e8f4da))
* **console:** mutate after connector delete ([#1475](https://github.com/logto-io/logto/issues/1475)) ([da882ce](https://github.com/logto-io/logto/commit/da882cee85461899ff32e6db2a07943830e41512))
* **console:** pagination color should be color-text-link ([#1466](https://github.com/logto-io/logto/issues/1466)) ([481b6a0](https://github.com/logto-io/logto/commit/481b6a05583891572bd405baefc9f44dabfb2942))
* **console:** provide fallback value for language field in settings ([5ad5eb2](https://github.com/logto-io/logto/commit/5ad5eb2ad9ef0cabefb6386ca1d84456f17dc547))
* **console:** remove session doc link ([#1479](https://github.com/logto-io/logto/issues/1479)) ([bb790ce](https://github.com/logto-io/logto/commit/bb790ce4d1c552dd6392a0fedb29c655aa41c979))
* **console:** set language in request header ([#1485](https://github.com/logto-io/logto/issues/1485)) ([f2195dd](https://github.com/logto-io/logto/commit/f2195dd8f314b766c6a47bdc094061f695c59b89))
* **console:** specify toast type ([#1499](https://github.com/logto-io/logto/issues/1499)) ([bdbeee0](https://github.com/logto-io/logto/commit/bdbeee0db58834b2c9633ef8a75accedfa3a7f0f))
* **core:** add session check ([#1453](https://github.com/logto-io/logto/issues/1453)) ([78e06d5](https://github.com/logto-io/logto/commit/78e06d5c7f458d9174f4d057ba83f738717510f5))
* **demo-app:** username should not overflow info card ([#1498](https://github.com/logto-io/logto/issues/1498)) ([58558e5](https://github.com/logto-io/logto/commit/58558e50110349262c7a28f0195a7042f6fca732))
* **ui:** add form submit event ([#1489](https://github.com/logto-io/logto/issues/1489)) ([f52fa58](https://github.com/logto-io/logto/commit/f52fa5891d70bf9a50c76eb3efa35f6031dc88cb))



## [1.0.0-alpha.3](https://github.com/logto-io/logto/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-07)


### Features

* **console:** open docs on documentation tab clicked ([#1444](https://github.com/logto-io/logto/issues/1444)) ([340c641](https://github.com/logto-io/logto/commit/340c641f4e135077b90ad83c291d380d930aacf8))
* **core:** append additional yaml responses to swagger.json ([#1407](https://github.com/logto-io/logto/issues/1407)) ([100bffb](https://github.com/logto-io/logto/commit/100bffbc6aa51478bda432ba01491a708bdcd172))


### Bug Fixes

* **connector:** fix Aliyun SMS connector error handling ([#1227](https://github.com/logto-io/logto/issues/1227)) ([d9ba729](https://github.com/logto-io/logto/commit/d9ba72985d016a762b3946dcbb6917db562e9b0b))
* **console:** language auto detection ([7c880fc](https://github.com/logto-io/logto/commit/7c880fc3e6c45dca11e59f1bb4d4623cf2415255))
* **console:** mutate data after sie welcome done ([#1447](https://github.com/logto-io/logto/issues/1447)) ([33106aa](https://github.com/logto-io/logto/commit/33106aac93fdb87579dcc178e034360decca9a4f))
* **console:** set user select to none for link button ([#1446](https://github.com/logto-io/logto/issues/1446)) ([d293de0](https://github.com/logto-io/logto/commit/d293de0d031821b0ea9aa388eb599bfafb8a23c0))
* **console:** vanilla sdk integration guide ([58fe92e](https://github.com/logto-io/logto/commit/58fe92e914dd1e5e52ff3942123299eefde56cd0))
* **core,ui:** remove todo comments ([#1454](https://github.com/logto-io/logto/issues/1454)) ([d5d6c5e](https://github.com/logto-io/logto/commit/d5d6c5ed083364dabaa0220deaa6a22e0350d146))
* **deps:** update dependency koa-router to v11 ([#1406](https://github.com/logto-io/logto/issues/1406)) ([ff6f223](https://github.com/logto-io/logto/commit/ff6f2235eaa2a146f11de9299e38fb1b7fae9bc6))



## [1.0.0-alpha.2](https://github.com/logto-io/logto/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2022-07-07)


### Features

* **console:** add unsaved changes alert for connector config ([#1414](https://github.com/logto-io/logto/issues/1414)) ([78407fc](https://github.com/logto-io/logto/commit/78407fc6c9d8a18d8253e0052c63ea1dd63de576))
* **console:** user settings unsaved changes alert ([#1411](https://github.com/logto-io/logto/issues/1411)) ([14b27b6](https://github.com/logto-io/logto/commit/14b27b6d0de226518ad1e31dd117c1a567e05015))


### Bug Fixes

* **console:** chagne user added modal button to done ([#1438](https://github.com/logto-io/logto/issues/1438)) ([ec82507](https://github.com/logto-io/logto/commit/ec82507ca1107154676599afe16491e382a1d524))
* **console:** dashboard chart yaxios width ([#1435](https://github.com/logto-io/logto/issues/1435)) ([b26fb0c](https://github.com/logto-io/logto/commit/b26fb0c0c32e7bf2e361acd5e71cf20740bba25b))
* **console:** fix typo for variant ([#1423](https://github.com/logto-io/logto/issues/1423)) ([f6be19e](https://github.com/logto-io/logto/commit/f6be19e1e321eafd5672b88c6e7f54976032d673))
* **console:** use icon button in copytoclipboard ([#1440](https://github.com/logto-io/logto/issues/1440)) ([f8a9743](https://github.com/logto-io/logto/commit/f8a9743b2ea978fa2802ac8da4f51f7801d3a87a))
* **ui:** dark mode seed ([#1426](https://github.com/logto-io/logto/issues/1426)) ([be73dbf](https://github.com/logto-io/logto/commit/be73dbf4ef14cf49779775dd95848ba73904a4b2))
* **ui:** set ui specific i18n storage key ([#1441](https://github.com/logto-io/logto/issues/1441)) ([5b121d7](https://github.com/logto-io/logto/commit/5b121d78551d471125737daf31d4e0505e69e409))



## [1.0.0-alpha.1](https://github.com/logto-io/logto/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-07-05)


### Features

* **console:** unsaved changes alert ([#1409](https://github.com/logto-io/logto/issues/1409)) ([098367e](https://github.com/logto-io/logto/commit/098367e1a380d81261e056f222131f34fb6e10c5))


### Bug Fixes

* **console:** dashbaord chart grid color ([#1417](https://github.com/logto-io/logto/issues/1417)) ([1d5f69d](https://github.com/logto-io/logto/commit/1d5f69db127a939f4c893f27230a96f6acb67f6e))
* **console:** leave page button should be primary on unsaved changes alert modal ([#1421](https://github.com/logto-io/logto/issues/1421)) ([be004fa](https://github.com/logto-io/logto/commit/be004fa4dab3c61b8396194c7604641ab2d82aad))
* **core:** do not titlize tags of .well-known APIs ([#1412](https://github.com/logto-io/logto/issues/1412)) ([5559fb1](https://github.com/logto-io/logto/commit/5559fb10c33932300d9f863cb3f57c48c504acdc))



## [1.0.0-alpha.0](https://github.com/logto-io/logto/compare/v0.1.2-alpha.5...v1.0.0-alpha.0) (2022-07-04)


### Features

* **console:** update task complete icon ([#1395](https://github.com/logto-io/logto/issues/1395)) ([06f190b](https://github.com/logto-io/logto/commit/06f190b2c48acfc853c9f675bf918c43c17f800a))


### Bug Fixes

* **console:** disable secondary should remove sign in methods ([#1384](https://github.com/logto-io/logto/issues/1384)) ([6e3c461](https://github.com/logto-io/logto/commit/6e3c461a88c2ae39089fcf2df26ee06a139381a0))
* **console:** hide reset description on dark-mode primary color matched ([#1394](https://github.com/logto-io/logto/issues/1394)) ([de8f476](https://github.com/logto-io/logto/commit/de8f476b372134cf23dd01a1c7872b16bbc5e5c4))
* **console:** remove userinfo endpoint on application details page ([#1391](https://github.com/logto-io/logto/issues/1391)) ([a837d79](https://github.com/logto-io/logto/commit/a837d793d0e7bc9818013ba0adc2f8c03e4fab21))
* **console:** save sie when secondary method is disabled ([#1410](https://github.com/logto-io/logto/issues/1410)) ([52fee4c](https://github.com/logto-io/logto/commit/52fee4c4226c1fbc3d906f12dd2613200e56595f))
* **console:** use png for calendar icon ([#1385](https://github.com/logto-io/logto/issues/1385)) ([f01390a](https://github.com/logto-io/logto/commit/f01390a7b2f103f0ab7ec0817ea6e2e267390923))
* update en.ts ([#1403](https://github.com/logto-io/logto/issues/1403)) ([05c5740](https://github.com/logto-io/logto/commit/05c5740d3cd99dca9b2d8a4d52488b06ef0da957))



### [0.1.2-alpha.5](https://github.com/logto-io/logto/compare/v0.1.2-alpha.4...v0.1.2-alpha.5) (2022-07-03)

**Note:** Version bump only for package @logto/root





### [0.1.2-alpha.4](https://github.com/logto-io/logto/compare/v0.1.2-alpha.3...v0.1.2-alpha.4) (2022-07-03)

**Note:** Version bump only for package @logto/root





### [0.1.2-alpha.3](https://github.com/logto-io/logto/compare/v0.1.2-alpha.2...v0.1.2-alpha.3) (2022-07-03)


### Features

* **console:** add traditional web guide - express js demo ([60c9ceb](https://github.com/logto-io/logto/commit/60c9ceb085a969195eb16e021870972cb70fd4b0))
* **core:** auto sign-out ([#1369](https://github.com/logto-io/logto/issues/1369)) ([6c32340](https://github.com/logto-io/logto/commit/6c323403b391ac09100aad87e7c9f59b588bdd45))



### [0.1.2-alpha.2](https://github.com/logto-io/logto/compare/v0.1.2-alpha.1...v0.1.2-alpha.2) (2022-07-02)


### Features

* **console:** add loading skeleton to sign in experience page ([76921f5](https://github.com/logto-io/logto/commit/76921f58b7fa17f2b4a34088ed9a0ab7e9d0d820))



### [0.1.2-alpha.1](https://github.com/logto-io/logto/compare/v0.1.2-alpha.0...v0.1.2-alpha.1) (2022-07-02)

**Note:** Version bump only for package @logto/root





### [0.1.2-alpha.0](https://github.com/logto-io/logto/compare/v0.1.1-alpha.0...v0.1.2-alpha.0) (2022-07-02)

**Note:** Version bump only for package @logto/root





### [0.1.1-alpha.0](https://github.com/logto-io/logto/compare/v0.1.0-internal...v0.1.1-alpha.0) (2022-07-01)


### Features

* **AC:** content updates ([#1003](https://github.com/logto-io/logto/issues/1003)) ([320a00b](https://github.com/logto-io/logto/commit/320a00bcf420d08252f9edf578dc36efd8742bce))
* **ac:** implement admin console welcome page ([#1139](https://github.com/logto-io/logto/issues/1139)) ([b42f4ba](https://github.com/logto-io/logto/commit/b42f4ba1ff11c769efece9f5cea75014924516fc))
* **connector-alipay-native:** add Alipay Native connector ([#873](https://github.com/logto-io/logto/issues/873)) ([9589aea](https://github.com/logto-io/logto/commit/9589aeafec8592531aa1dfe598ca6cec7325eded))
* **connector-alipay:** parse code from json ([c248759](https://github.com/logto-io/logto/commit/c248759b53faa39a22906139f3a4049633c8b2a9))
* **connector-sendgrid-email:** add sendgrid email connector ([#850](https://github.com/logto-io/logto/issues/850)) ([b887655](https://github.com/logto-io/logto/commit/b8876558275e28ca921d4eeea6c38f8559810a11))
* **connector-twilio-sms:** add twilio sms connector ([#881](https://github.com/logto-io/logto/issues/881)) ([d7ce13d](https://github.com/logto-io/logto/commit/d7ce13d260ec79e0c0f68bf3068cb9c79adf5273))
* **connector-types/wechat-native:** fix wechat native getAuthUri ([#895](https://github.com/logto-io/logto/issues/895)) ([d6de6a8](https://github.com/logto-io/logto/commit/d6de6a8e73367effa2a755aae10f9e2f1cab9638))
* **connector:** apple ([#966](https://github.com/logto-io/logto/issues/966)) ([7400ed8](https://github.com/logto-io/logto/commit/7400ed8896fdceda6165a0540413efb4e3a47438))
* **connectors:** add logo for connectors ([#914](https://github.com/logto-io/logto/issues/914)) ([a3a7c52](https://github.com/logto-io/logto/commit/a3a7c52a91dba3603617a68e5ce47e0017081a91))
* **connectors:** handle authorization callback parameters in each connector respectively ([#1166](https://github.com/logto-io/logto/issues/1166)) ([097aade](https://github.com/logto-io/logto/commit/097aade2e2e1b1ea1531bcb4c1cca8d24961a9b9))
* **console,core:** hide admin user ([#1182](https://github.com/logto-io/logto/issues/1182)) ([9194a6e](https://github.com/logto-io/logto/commit/9194a6ee547e2eb83ec106a834409c33644481e5))
* **console,ui:** generate dark mode color in console ([#1231](https://github.com/logto-io/logto/issues/1231)) ([f72b21d](https://github.com/logto-io/logto/commit/f72b21d1602ab0fb35ef3e7d84f6c8ebd7e18b08))
* **console:** add 404 page in admin console ([0d047fb](https://github.com/logto-io/logto/commit/0d047fbaf115f005615b5df06170e526283d9335))
* **console:** add app icon and api icon ([#830](https://github.com/logto-io/logto/issues/830)) ([373d349](https://github.com/logto-io/logto/commit/373d349db73be01fdbd653c917f7cf9f3817d4d5))
* **console:** add application column in user management ([#728](https://github.com/logto-io/logto/issues/728)) ([a035587](https://github.com/logto-io/logto/commit/a0355872c65bc0da27e57e25568fbe5dcc5b671b))
* **console:** add column lastSignIn in user management ([#679](https://github.com/logto-io/logto/issues/679)) ([a0b4b98](https://github.com/logto-io/logto/commit/a0b4b98c35ff08c2df0863e4bc2110386fc54aee))
* **console:** add comopnent alert ([#706](https://github.com/logto-io/logto/issues/706)) ([60920c2](https://github.com/logto-io/logto/commit/60920c28dd0ab5481138264a0961d674abaa613b))
* **console:** add date picker in dashboard ([#1085](https://github.com/logto-io/logto/issues/1085)) ([5a073ce](https://github.com/logto-io/logto/commit/5a073ceb60932cb4f998bf5f6e80792e63c6552d))
* **console:** add details summary component in guides ([693c4f0](https://github.com/logto-io/logto/commit/693c4f0422eb312190f2c7b0673e3ceaa8c41213))
* **console:** add drawer animation ([#760](https://github.com/logto-io/logto/issues/760)) ([dd8b767](https://github.com/logto-io/logto/commit/dd8b7671306b4f712eb56cee339cc38a0c7061fc))
* **console:** add integration guide for vue sdk ([423b1a9](https://github.com/logto-io/logto/commit/423b1a98b88b9342a52f8cce176b2a23208bf9f0))
* **console:** add integration guide for vue sdk ([4931923](https://github.com/logto-io/logto/commit/4931923e1c9f58c0da0eebad49f11cfb9c45d30a))
* **console:** add mobile web tab in preview ([#1214](https://github.com/logto-io/logto/issues/1214)) ([9b6fd4c](https://github.com/logto-io/logto/commit/9b6fd4c417f2ee53375e436c839b711c86403d58))
* **console:** add page loading skeleton to data table and detail pages ([9b8658d](https://github.com/logto-io/logto/commit/9b8658d9c1d0b916ac4bd00e0355018f3dafb864))
* **console:** add placeholders ([#1277](https://github.com/logto-io/logto/issues/1277)) ([c26ca08](https://github.com/logto-io/logto/commit/c26ca08fb1109a2f3dae53bc8a1db5d8d7f6f47f))
* **console:** add prevew in guide modal ([#839](https://github.com/logto-io/logto/issues/839)) ([002f839](https://github.com/logto-io/logto/commit/002f839e31c26733adb8865e6ed3be5464865799))
* **console:** add user dropdown and sign out button ([5a09e7d](https://github.com/logto-io/logto/commit/5a09e7d6aa0d74215b299ef95b94bc715392cb77))
* **console:** audit log filters ([#1004](https://github.com/logto-io/logto/issues/1004)) ([a0d562f](https://github.com/logto-io/logto/commit/a0d562f7f24e10481c269b761c9a2c152affd50e))
* **console:** audit log table ([#1000](https://github.com/logto-io/logto/issues/1000)) ([fdd12de](https://github.com/logto-io/logto/commit/fdd12de1cf39c36dd65dd9365ad343478718d112))
* **console:** autofocus in create modal ([#785](https://github.com/logto-io/logto/issues/785)) ([b8143ff](https://github.com/logto-io/logto/commit/b8143ff1a7d79af9c21f07ece1ed8f6436d18474))
* **console:** clear search results ([#1199](https://github.com/logto-io/logto/issues/1199)) ([a2de467](https://github.com/logto-io/logto/commit/a2de467873d4d92d52660b8095b831971402a8da))
* **console:** configure cors-allowed-origins ([#695](https://github.com/logto-io/logto/issues/695)) ([4a0577a](https://github.com/logto-io/logto/commit/4a0577accdb36e2b916b0e520b3352f6426b64c7))
* **console:** connector detail top card ([5288d6d](https://github.com/logto-io/logto/commit/5288d6d6f488077e4e9166a850f37c4283c93fe2))
* **console:** connector groups table ([#962](https://github.com/logto-io/logto/issues/962)) ([eb3f0cb](https://github.com/logto-io/logto/commit/eb3f0cbf5bb70bbab0e56e0f035f72594bfc555c))
* **console:** connector in use status ([#1012](https://github.com/logto-io/logto/issues/1012)) ([542d574](https://github.com/logto-io/logto/commit/542d57426fa8be1ccd98b6ab59ccac85e6d14a1b))
* **console:** connector logo and platform icon ([#892](https://github.com/logto-io/logto/issues/892)) ([97e6bdd](https://github.com/logto-io/logto/commit/97e6bdd8aacdf12dcf99a984d7b5bcd2f61f1530))
* **console:** connector warnings in sign in methods ([#710](https://github.com/logto-io/logto/issues/710)) ([cd03130](https://github.com/logto-io/logto/commit/cd0313065c777df3cf36373b31a2bb7e0e77cfe6))
* **console:** contact us icon and texts ([#836](https://github.com/logto-io/logto/issues/836)) ([c3785d8](https://github.com/logto-io/logto/commit/c3785d86cd6d377fbd5612e4b54529371dce19ee))
* **console:** dark logo ([#860](https://github.com/logto-io/logto/issues/860)) ([664a218](https://github.com/logto-io/logto/commit/664a2180a51b577fb517661cf0d7efb1374f3858))
* **console:** dashboard blocks and curve ([#1076](https://github.com/logto-io/logto/issues/1076)) ([c38fab8](https://github.com/logto-io/logto/commit/c38fab89e15203e6e2a7e95258c837598389c24b))
* **console:** dashboard skeleton ([#1077](https://github.com/logto-io/logto/issues/1077)) ([5afbe9d](https://github.com/logto-io/logto/commit/5afbe9d70b531ee54d043c543addf98f5bf0a114))
* **console:** disable existing connectors when adding ([#1018](https://github.com/logto-io/logto/issues/1018)) ([19380d0](https://github.com/logto-io/logto/commit/19380d08739d219169bda1e1e8c2bf9101bd0e67))
* **console:** disallow management api deletion and renaming ([#1233](https://github.com/logto-io/logto/issues/1233)) ([568b75d](https://github.com/logto-io/logto/commit/568b75dffc9ce8335aced31f1a207f958bf133cb))
* **console:** display topbar shadow while scrolling ([#1340](https://github.com/logto-io/logto/issues/1340)) ([b3774cd](https://github.com/logto-io/logto/commit/b3774cd43aa6141f06bf282c69e3cc419fa5b504))
* **console:** dynamic sign in methods form ([#666](https://github.com/logto-io/logto/issues/666)) ([5944ff0](https://github.com/logto-io/logto/commit/5944ff075eca5f47b949a6100049f42074891be1))
* **console:** error handling in dashboard ([#1090](https://github.com/logto-io/logto/issues/1090)) ([6d3857e](https://github.com/logto-io/logto/commit/6d3857ef3580e9faf1f3b8a8ff8303b48c04aea4))
* **console:** form field tooltip ([#786](https://github.com/logto-io/logto/issues/786)) ([1c7de47](https://github.com/logto-io/logto/commit/1c7de47a9326f326d5ec98fd9336037f5b75bf94))
* **console:** group connectors in add modal ([#1029](https://github.com/logto-io/logto/issues/1029)) ([fa420c9](https://github.com/logto-io/logto/commit/fa420c9fcb30450d1f0c8833bfe4febd031de5ba))
* **console:** hard code admin display name with username ([#1348](https://github.com/logto-io/logto/issues/1348)) ([496b17b](https://github.com/logto-io/logto/commit/496b17b5277b544230bba3e8a3782ffcc32e11d7))
* **console:** hide get-started page on clicking 'Hide this' button ([7fd42fd](https://github.com/logto-io/logto/commit/7fd42fdaa17217f8be6ea120e287ea243904977a))
* **console:** implement get started page ([9790767](https://github.com/logto-io/logto/commit/979076769a069a3f100f33ed4cec9445ee0e18f5))
* **console:** implement get-started progress indicator component ([ed9387b](https://github.com/logto-io/logto/commit/ed9387bdda69d611ef7328214be300e17fa47135))
* **console:** init dashboard ([#1006](https://github.com/logto-io/logto/issues/1006)) ([28e09b6](https://github.com/logto-io/logto/commit/28e09b699424bb129a964ad61440e230c8baff50))
* **console:** input error message ([#1050](https://github.com/logto-io/logto/issues/1050)) ([458602f](https://github.com/logto-io/logto/commit/458602fd649170faab915e5079c56eb85540cb8e))
* **console:** integrate admin console language settings ([048290b](https://github.com/logto-io/logto/commit/048290b49f5f4c08882b1c51a289d31b7f18b590))
* **console:** integrate dark mode settings ([a04f818](https://github.com/logto-io/logto/commit/a04f818ffb8627a5c3d594edb466d1b8e45e3015))
* **console:** log details page ([#1064](https://github.com/logto-io/logto/issues/1064)) ([0421195](https://github.com/logto-io/logto/commit/04211957e1222f9597c32afd2982258afa73fa31))
* **console:** multi-text-input delete reminder ([#752](https://github.com/logto-io/logto/issues/752)) ([04fc5d4](https://github.com/logto-io/logto/commit/04fc5d48e9329b8fd713295207271803b54bbf35))
* **console:** page skeleton animation mixin ([de97bb5](https://github.com/logto-io/logto/commit/de97bb53f5dab4be38d89b5b8d97a40c9c22d062))
* **console:** platform label in connectors table ([#1034](https://github.com/logto-io/logto/issues/1034)) ([96701bc](https://github.com/logto-io/logto/commit/96701bcb746f1ed1d1413139033998a95e668de9))
* **console:** preview device wrapper ([#896](https://github.com/logto-io/logto/issues/896)) ([540bf9c](https://github.com/logto-io/logto/commit/540bf9c0555c84b324895233b860f72c660997bd))
* **console:** reset user password ([#1266](https://github.com/logto-io/logto/issues/1266)) ([8c46ead](https://github.com/logto-io/logto/commit/8c46eada4be16fee3c7d6b5ec2786b3d9b214b00))
* **console:** show app guide in "Check Help Guide" drawer ([e3cab67](https://github.com/logto-io/logto/commit/e3cab6767012ad556bef7889e1540480a57cf946))
* **console:** sie form reorg ([#1218](https://github.com/logto-io/logto/issues/1218)) ([2c41334](https://github.com/logto-io/logto/commit/2c413341d1c515049faa130416f7a5e591d10e8a))
* **console:** sign in exp guide ([#755](https://github.com/logto-io/logto/issues/755)) ([bafd094](https://github.com/logto-io/logto/commit/bafd09474c68ca5539d676d2cbf06fa16e070edb))
* **console:** sign in experience preview ([#783](https://github.com/logto-io/logto/issues/783)) ([6ab54c9](https://github.com/logto-io/logto/commit/6ab54c968b38ce9d12f15ad2ec5615748b79d269))
* **console:** sign in experience setup others tab ([#662](https://github.com/logto-io/logto/issues/662)) ([875a31e](https://github.com/logto-io/logto/commit/875a31ec2ab129df13abf9036ead3922f786187e))
* **console:** sign in experience welcome page ([#746](https://github.com/logto-io/logto/issues/746)) ([d815d96](https://github.com/logto-io/logto/commit/d815d96f1f664ee0b700f6b2b1dfc36d87f1c2df))
* **console:** sign in methods change alert ([#701](https://github.com/logto-io/logto/issues/701)) ([a1ceea0](https://github.com/logto-io/logto/commit/a1ceea068542e46db3ed7f873f339edb3803ea3f))
* **console:** support dark logo for connectors ([#1226](https://github.com/logto-io/logto/issues/1226)) ([a8467fd](https://github.com/logto-io/logto/commit/a8467fd09389f8797f94f39f4a3d6c3dc55667fe))
* **console:** support persisting get-started progress in settings config ([43b2309](https://github.com/logto-io/logto/commit/43b2309c994b2eb8b1b8f1c12893eb66b5ce1d95))
* **console:** update cn phrases ([#1255](https://github.com/logto-io/logto/issues/1255)) ([77e1033](https://github.com/logto-io/logto/commit/77e1033751a34982c527d78a05a86502a2ee1f97))
* **console:** update connector icons ([#935](https://github.com/logto-io/logto/issues/935)) ([f01d113](https://github.com/logto-io/logto/commit/f01d11344534bc82df9cfc44d2c6287c36edd0fd))
* **console:** update pagination size and color ([#1153](https://github.com/logto-io/logto/issues/1153)) ([fdb8b24](https://github.com/logto-io/logto/commit/fdb8b246a3782c1b90e554c657452ce17629ad2f))
* **console:** update user management table row height and avatar size ([#1151](https://github.com/logto-io/logto/issues/1151)) ([b2b7f37](https://github.com/logto-io/logto/commit/b2b7f370a423bbff2148a75f120916d971ce5581))
* **console:** user connector delete confirmation ([#1165](https://github.com/logto-io/logto/issues/1165)) ([4905a5d](https://github.com/logto-io/logto/commit/4905a5d72f7007213a24dd64251ee26a53aabf6b))
* **console:** user icon ([#857](https://github.com/logto-io/logto/issues/857)) ([9f94f16](https://github.com/logto-io/logto/commit/9f94f16be730d147fc00c35725a90eda363b5995))
* **console:** user logs ([#1082](https://github.com/logto-io/logto/issues/1082)) ([c4a0d7a](https://github.com/logto-io/logto/commit/c4a0d7ae35b45410423da300fbee1d78e7c6ef6e))
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
* **core:** add experience configs ([#745](https://github.com/logto-io/logto/issues/745)) ([08904b8](https://github.com/logto-io/logto/commit/08904b8f93f39cfd24dae88746e5b18ce35ff0b4))
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
* **core:** wrap aliyun direct mail connector ([#660](https://github.com/logto-io/logto/issues/660)) ([54b6209](https://github.com/logto-io/logto/commit/54b62094c8d8af0611cf64e39306c4f1a216e8f6))
* **core:** wrap aliyun short message service connector ([#670](https://github.com/logto-io/logto/issues/670)) ([a06d3ee](https://github.com/logto-io/logto/commit/a06d3ee73ccc59f6aaef1dab4f45d6c118aab40d))
* **core:** wrap facebook connector ([#672](https://github.com/logto-io/logto/issues/672)) ([cbd6cfa](https://github.com/logto-io/logto/commit/cbd6cfae8af7faee19a62869552acf2c6ca54125))
* **core:** wrap github connector ([#673](https://github.com/logto-io/logto/issues/673)) ([3a956fa](https://github.com/logto-io/logto/commit/3a956fae1044ad2d419313099820f6b386013bb7))
* **core:** wrap google connector ([#674](https://github.com/logto-io/logto/issues/674)) ([2049b4f](https://github.com/logto-io/logto/commit/2049b4f73a9680699fd6ba9b85ce29a1ebc49719))
* **core:** wrap wechat connector ([#676](https://github.com/logto-io/logto/issues/676)) ([e56a489](https://github.com/logto-io/logto/commit/e56a4894b792f175048001159d79de47986e8e80))
* **dashboard:** add tooltip to dashboard items ([#1089](https://github.com/logto-io/logto/issues/1089)) ([9dd73ac](https://github.com/logto-io/logto/commit/9dd73ac1420c71093ee2a4ea35dc7d622ef062de))
* **demo-app:** implement (part 2) ([85a055e](https://github.com/logto-io/logto/commit/85a055efa4358cfb69c0d74f7aeaeb0bade024af))
* **demo-app:** implementation ([#982](https://github.com/logto-io/logto/issues/982)) ([7f4f4f8](https://github.com/logto-io/logto/commit/7f4f4f84addf8a25c3d30f1ac3ceeef460afcf17))
* **demo-app:** implementation (3/3) ([#1021](https://github.com/logto-io/logto/issues/1021)) ([91e2f05](https://github.com/logto-io/logto/commit/91e2f055f2eb75ef8846b02d0d211adbbb898b41))
* **demo-app:** init ([#979](https://github.com/logto-io/logto/issues/979)) ([ad0aa8e](https://github.com/logto-io/logto/commit/ad0aa8e0c20a8d60f095b477e942b724fb53ca7d))
* **demo-app:** show notification in main flow ([#1038](https://github.com/logto-io/logto/issues/1038)) ([90ca76e](https://github.com/logto-io/logto/commit/90ca76eeb5460b66d2241f137f179bf4d5d6ae37))
* **native-connectors:** pass random state to native connector sdk ([#922](https://github.com/logto-io/logto/issues/922)) ([9679620](https://github.com/logto-io/logto/commit/96796203dd4247d7ecdee044f13f3d57f04ca461))
* remove target, platform from connector schema and add id to metadata ([#930](https://github.com/logto-io/logto/issues/930)) ([054b0f7](https://github.com/logto-io/logto/commit/054b0f7b6a6dfed66540042ea69b0721126fe695))
* **schemas:** create log indices on application id and user id ([#933](https://github.com/logto-io/logto/issues/933)) ([bf6e08c](https://github.com/logto-io/logto/commit/bf6e08c37233da372bc5570f9855df023704a93b))
* **schemas:** make users.avatar URL length 2048 ([#1141](https://github.com/logto-io/logto/issues/1141)) ([3ac01d7](https://github.com/logto-io/logto/commit/3ac01d72f9d30eca5836dcfbddd1700ebb3ddac1))
* **shared,phrases-ui:** not allow hyphens in username ([#1319](https://github.com/logto-io/logto/issues/1319)) ([5e81966](https://github.com/logto-io/logto/commit/5e819665c7c1d584ff5cff25e4e0723122be78b2))
* **sms/email-connectors:** expose third-party API request error message ([#1059](https://github.com/logto-io/logto/issues/1059)) ([4cfd578](https://github.com/logto-io/logto/commit/4cfd5788d24d55017a8ace53fed99082f87691cb))
* **ui:** add bind social account flow ([#671](https://github.com/logto-io/logto/issues/671)) ([5e251bd](https://github.com/logto-io/logto/commit/5e251bdc0818195d7eb104488bdb8a3194205bdd))
* **ui:** add darkmode logo ([#880](https://github.com/logto-io/logto/issues/880)) ([9fa13a2](https://github.com/logto-io/logto/commit/9fa13a24ae2e1b3024b3ef2169736d27847f04eb))
* **ui:** add global primary color settings ([#871](https://github.com/logto-io/logto/issues/871)) ([0f2827c](https://github.com/logto-io/logto/commit/0f2827ccb873bf30e44209da39803ac6cc839af2))
* **ui:** add mobile terms of use iframe modal ([#947](https://github.com/logto-io/logto/issues/947)) ([4abcda6](https://github.com/logto-io/logto/commit/4abcda6820f0d824d110ee3ddd6d457433dfbf26))
* **ui:** add native sdk guard logic ([#1096](https://github.com/logto-io/logto/issues/1096)) ([147775a](https://github.com/logto-io/logto/commit/147775a8f45dbb5bbf05b3bf1b7c11c0a8acf4a4))
* **ui:** add Notification component ([#994](https://github.com/logto-io/logto/issues/994)) ([8530e24](https://github.com/logto-io/logto/commit/8530e249aa6d63efe594a08f800be4bfb43ed77e))
* **ui:** add social dropdown list for desktop ([#834](https://github.com/logto-io/logto/issues/834)) ([36922b3](https://github.com/logto-io/logto/commit/36922b343f06daa1c7d4125bd0066ec06962123d))
* **ui:** app notification ([#999](https://github.com/logto-io/logto/issues/999)) ([f4e380f](https://github.com/logto-io/logto/commit/f4e380f0b1b815314b24cec1c9013d9f3bb806a7))
* **ui:** display error message on social callback page ([#1097](https://github.com/logto-io/logto/issues/1097)) ([f3b8678](https://github.com/logto-io/logto/commit/f3b8678a8c5e938276208c222242c3fedf4d397a))
* **ui:** implement preview mode ([#852](https://github.com/logto-io/logto/issues/852)) ([ef19fb3](https://github.com/logto-io/logto/commit/ef19fb3d27a84509613b1f1d47819c06e9a6e9d1))
* **ui:** init destop styling foundation ([#787](https://github.com/logto-io/logto/issues/787)) ([5c02ec3](https://github.com/logto-io/logto/commit/5c02ec3bdae162bd83d26c56f7ae34ee6e505ca2))
* **ui:** not found page ([#691](https://github.com/logto-io/logto/issues/691)) ([731ff1c](https://github.com/logto-io/logto/commit/731ff1cbdca76104845dcf3d1223953ce8e5af93))
* update field check rules ([#854](https://github.com/logto-io/logto/issues/854)) ([85a407c](https://github.com/logto-io/logto/commit/85a407c5f6f76fed0513acd6fb41943413935b5a))
* use user level custom data to save preferences ([#1045](https://github.com/logto-io/logto/issues/1045)) ([f2b44b4](https://github.com/logto-io/logto/commit/f2b44b49f9763b365b0062000146fee2b8df72a9))


### Bug Fixes

* `lint:report` script ([#730](https://github.com/logto-io/logto/issues/730)) ([3b17324](https://github.com/logto-io/logto/commit/3b17324d189b2fe47985d0bee8b37b4ef1dbdd2b))
* **ac:** fix ac text input ([#1023](https://github.com/logto-io/logto/issues/1023)) ([498b370](https://github.com/logto-io/logto/commit/498b3708efce31b5b320540d3267a130d948b4b8))
* alipay native ([895a24b](https://github.com/logto-io/logto/commit/895a24b41eafddde82c94668d742613a333b6991))
* **ci:** use local commitlint ([#723](https://github.com/logto-io/logto/issues/723)) ([4e7dfe2](https://github.com/logto-io/logto/commit/4e7dfe2bec75228b001d76a5e267691d1f58f815))
* **connector-alipay-native:** fix data guard ([#992](https://github.com/logto-io/logto/issues/992)) ([2dc50d6](https://github.com/logto-io/logto/commit/2dc50d65318dfc7d64034bd3c501cec8feb5dde1))
* **connector-alipay-web:** rename input param name code to auth_code ([#1015](https://github.com/logto-io/logto/issues/1015)) ([1e27ee7](https://github.com/logto-io/logto/commit/1e27ee7630e08fb96cb08dfe9b5654b92bac6924))
* **connector-aliyun-sms:** fix config guard, remove unnecessary fields ([#1229](https://github.com/logto-io/logto/issues/1229)) ([4ee7752](https://github.com/logto-io/logto/commit/4ee775273ac6c97b6580a40ec20cb3f5df8285f4))
* **connector-github:** convert `null` value to `undefined` in user info response ([#944](https://github.com/logto-io/logto/issues/944)) ([c325cf6](https://github.com/logto-io/logto/commit/c325cf60f9c0edc955aba0106efb2ec8d61a2fdc))
* **connector-wechat-native:** fix wechat-native target ([#820](https://github.com/logto-io/logto/issues/820)) ([ab6c124](https://github.com/logto-io/logto/commit/ab6c1246207fd191b1db27d172500a5e7a2d8050))
* connectors platform ([#925](https://github.com/logto-io/logto/issues/925)) ([16ec018](https://github.com/logto-io/logto/commit/16ec018b711baeec28a22a7780370044c230bd24))
* **connector:** test ([d327c6f](https://github.com/logto-io/logto/commit/d327c6fdf5f4a3fbc68618f46df7ac213d77aed5))
* **console,core:** only show enabled connectors in sign in methods ([#988](https://github.com/logto-io/logto/issues/988)) ([4768181](https://github.com/logto-io/logto/commit/4768181bf77261eb84a1c4cb903fa0a22765d837))
* **console:** add border and shadow to preview ([#957](https://github.com/logto-io/logto/issues/957)) ([5fc2c99](https://github.com/logto-io/logto/commit/5fc2c991a477e3ddb05f3a29b63ee95ae8232cef))
* **console:** add bottom color for connector logos ([#1186](https://github.com/logto-io/logto/issues/1186)) ([c5cebfc](https://github.com/logto-io/logto/commit/c5cebfc297397548109303b3a73223dd14ba1a7d))
* **console:** add code editor field label ([#1170](https://github.com/logto-io/logto/issues/1170)) ([9aab5ee](https://github.com/logto-io/logto/commit/9aab5eebf721fec2f3d57d87f7462e0fc728c114))
* **console:** add connector button in table empty state ([#1224](https://github.com/logto-io/logto/issues/1224)) ([1905fb5](https://github.com/logto-io/logto/commit/1905fb5718335712a96da6c09a9e6ae52bfbd34a))
* **console:** add hover state to hide guide button ([#1328](https://github.com/logto-io/logto/issues/1328)) ([323895a](https://github.com/logto-io/logto/commit/323895a2dcf8fd703c0ae551fa3394ec1297c2ae))
* **console:** add letter spacing for sign-in-experience title ([#1033](https://github.com/logto-io/logto/issues/1033)) ([cf4bd1b](https://github.com/logto-io/logto/commit/cf4bd1b999ebcdfb239e04a829422f5f70d5d693))
* **console:** add mobile platform preview description ([#1032](https://github.com/logto-io/logto/issues/1032)) ([6167e5c](https://github.com/logto-io/logto/commit/6167e5c28d564453b45ee48f41c3aa86381334a1))
* **console:** add sie preview nav margin ([#1275](https://github.com/logto-io/logto/issues/1275)) ([210ddce](https://github.com/logto-io/logto/commit/210ddcea67dcf78cf98440fa6c211bb9aa62546c))
* **console:** add toast message on save uri success in guide ([129ce0b](https://github.com/logto-io/logto/commit/129ce0b5681c4e8aea9d748ed95dbc679502699e))
* **console:** adding social connector should complete corresponding get-started task ([8797c2d](https://github.com/logto-io/logto/commit/8797c2d9d5de7f4a2f628aa3025586d976030682))
* **console:** adjust preview size ([#951](https://github.com/logto-io/logto/issues/951)) ([fa14589](https://github.com/logto-io/logto/commit/fa14589440d4aa083c9570f37823f37056fdf3ad))
* **console:** align added sign-in method with table head content ([#1028](https://github.com/logto-io/logto/issues/1028)) ([c084b44](https://github.com/logto-io/logto/commit/c084b442aea8707a7d8e70683da3d684e41251c6))
* **console:** align usage of customizeSignInExperience ([#837](https://github.com/logto-io/logto/issues/837)) ([808a676](https://github.com/logto-io/logto/commit/808a676da6239fa0471c65f9920bd9715bfe4c19))
* **console:** application icon size ([#1237](https://github.com/logto-io/logto/issues/1237)) ([86aec6c](https://github.com/logto-io/logto/commit/86aec6cdf3986ed3d6d661fc3f7c8d5521e1d27e))
* **console:** application integrate SDK guides ([b616e71](https://github.com/logto-io/logto/commit/b616e71a5f3009f9b984b48b7f082f4876d025c0))
* **console:** auto generate password ([#1133](https://github.com/logto-io/logto/issues/1133)) ([a424f1b](https://github.com/logto-io/logto/commit/a424f1b1d2fe2dc51b769d9d7aa1eb719b73523d))
* **console:** back to social connectors ([#889](https://github.com/logto-io/logto/issues/889)) ([8cf72d9](https://github.com/logto-io/logto/commit/8cf72d9d6ecb9ac88c7c20bcdf9d3d6650d23d17))
* **console:** bump react sdk to 0.1.13 to resolve sign in issue ([fb34cdc](https://github.com/logto-io/logto/commit/fb34cdc3793c3768e759c4e13a898716de22566c))
* **console:** button loading spinner position ([b41b8f1](https://github.com/logto-io/logto/commit/b41b8f1811fbedc57a48c705ca33075ba8607746))
* **console:** button space on the guide header ([#1317](https://github.com/logto-io/logto/issues/1317)) ([0e93792](https://github.com/logto-io/logto/commit/0e93792fe9cfa1943b565b1a23cf581a8185d32f))
* **console:** call settings API after user authentication ([3f25d4e](https://github.com/logto-io/logto/commit/3f25d4e6f65015e39fd756afd5cfb26b9fbd4a37))
* **console:** change account modal margin ([#1344](https://github.com/logto-io/logto/issues/1344)) ([f1a7cb3](https://github.com/logto-io/logto/commit/f1a7cb3afb2dc4031d1e3f282376fb10cba5644f))
* **console:** change application column name ([#743](https://github.com/logto-io/logto/issues/743)) ([6148cbd](https://github.com/logto-io/logto/commit/6148cbd6f949a79874ec918e9be7933b72f06124))
* **console:** change checkbox to controlled comp ([#1235](https://github.com/logto-io/logto/issues/1235)) ([9a72a34](https://github.com/logto-io/logto/commit/9a72a34cef51b7105ebd0e7ea9da875991a7a939))
* **console:** checkbox style ([#1327](https://github.com/logto-io/logto/issues/1327)) ([2f3c9ae](https://github.com/logto-io/logto/commit/2f3c9ae4fd9f28177466cb89589195c3aa4d6a75))
* **console:** clear error message before saving connector config ([#1273](https://github.com/logto-io/logto/issues/1273)) ([da48784](https://github.com/logto-io/logto/commit/da4878492fad8fcd90cc7e97943427c0ef12e724))
* **console:** connector card item style ([#1192](https://github.com/logto-io/logto/issues/1192)) ([ed3c93a](https://github.com/logto-io/logto/commit/ed3c93afdc303247d5ff71dc8b355f8b114a4b2c))
* **console:** connector details save changes footer ([#736](https://github.com/logto-io/logto/issues/736)) ([2d9b708](https://github.com/logto-io/logto/commit/2d9b7088a6f7f126b48eb2f395c255b7254b4b34))
* **console:** connector guide ([#990](https://github.com/logto-io/logto/issues/990)) ([3c37739](https://github.com/logto-io/logto/commit/3c37739107794466a30c44163743915d489bb3ae))
* **console:** connector guide setup content should scroll in the whole container ([#1314](https://github.com/logto-io/logto/issues/1314)) ([05399b5](https://github.com/logto-io/logto/commit/05399b5e594c0af591eadeb017af073cc9b9edcc))
* **console:** connector name in user detials ([#1147](https://github.com/logto-io/logto/issues/1147)) ([94084a4](https://github.com/logto-io/logto/commit/94084a49e77d964e4f9c230f88e3aa7d5e12179a))
* **console:** connector row clickable ([#1108](https://github.com/logto-io/logto/issues/1108)) ([2a4a61d](https://github.com/logto-io/logto/commit/2a4a61deabc827353ac7471565f25bb52d07fc1c))
* **console:** connector sender test loading state ([#1290](https://github.com/logto-io/logto/issues/1290)) ([7d47433](https://github.com/logto-io/logto/commit/7d47433cca2a8f6d3d11fb9a98c1b7c67d9710b2))
* **console:** contact us icons ([#1181](https://github.com/logto-io/logto/issues/1181)) ([e39704a](https://github.com/logto-io/logto/commit/e39704a8fa280201682f0e9e23d7b3f9d14e7d76))
* **console:** create connector form alignment ([#1220](https://github.com/logto-io/logto/issues/1220)) ([ebfab1d](https://github.com/logto-io/logto/commit/ebfab1d222be34a335478715c3cec38393e0af21))
* **console:** dashboard chart style ([#1177](https://github.com/logto-io/logto/issues/1177)) ([cf47044](https://github.com/logto-io/logto/commit/cf470446e4458e748bbf6384adb96d69805a1991)), closes [#1178](https://github.com/logto-io/logto/issues/1178)
* **console:** date picker input height ([#1171](https://github.com/logto-io/logto/issues/1171)) ([6ca1395](https://github.com/logto-io/logto/commit/6ca1395b8bf6e6b58c539b23fca2167ee3d47746))
* **console:** details page should not be shrinked ([#1338](https://github.com/logto-io/logto/issues/1338)) ([d73663a](https://github.com/logto-io/logto/commit/d73663af27a7a0f63d18e0015817aa5b5347cad9))
* **console:** display dark mode color setting only when dark mode is enabled ([#1027](https://github.com/logto-io/logto/issues/1027)) ([a506dc5](https://github.com/logto-io/logto/commit/a506dc5511e19bbf948ba96cab23489e2c55bbc3))
* **console:** display default avatar when the avatar is empty ([#1191](https://github.com/logto-io/logto/issues/1191)) ([71ed416](https://github.com/logto-io/logto/commit/71ed416bde2c03bc6808d0857f4e59725ad0015d))
* **console:** dropdown max height ([#1155](https://github.com/logto-io/logto/issues/1155)) ([402d19d](https://github.com/logto-io/logto/commit/402d19d5608fe695ae8c4f60172563b8f51511e1))
* **console:** dropdown padding ([#1168](https://github.com/logto-io/logto/issues/1168)) ([56d3f96](https://github.com/logto-io/logto/commit/56d3f96106c8f630bba327fe11b15dcc4719a423))
* **console:** error callstack content should not overflow container ([933950c](https://github.com/logto-io/logto/commit/933950cebf605195219dbf7f0c7a3405924bc9f6))
* **console:** error message in text input component ([#1060](https://github.com/logto-io/logto/issues/1060)) ([93916bf](https://github.com/logto-io/logto/commit/93916bfa5426f399b4cb8ceaca6bdfce5869c13e))
* **console:** fetch settings with swr on app init ([c7344c2](https://github.com/logto-io/logto/commit/c7344c2175164159978a499d1caa7e9f6808fac8))
* **console:** fix connector platform label i18n ([#1347](https://github.com/logto-io/logto/issues/1347)) ([b18388c](https://github.com/logto-io/logto/commit/b18388ce57f441b3c63b5441f90866bb09a28f80))
* **console:** fix dark mode char tooltip background ([#1345](https://github.com/logto-io/logto/issues/1345)) ([f6bf53b](https://github.com/logto-io/logto/commit/f6bf53bd8e639af62f00b465ca15bb947817e6e0))
* **console:** fix dashboard date ([#1274](https://github.com/logto-io/logto/issues/1274)) ([8c0ceff](https://github.com/logto-io/logto/commit/8c0ceff57480e5bf7a361b9c076fdf2ea6cb40eb))
* **console:** fix infinite loading issue when not authenticated ([32facc6](https://github.com/logto-io/logto/commit/32facc6e898213642c6753bc803349092f64d1d2))
* **console:** fix info icon vertical alignment ([#1106](https://github.com/logto-io/logto/issues/1106)) ([888c3d7](https://github.com/logto-io/logto/commit/888c3d767d0596ccb717789e3adf278d604ad88f))
* **console:** fix margin for SIE section ([#1212](https://github.com/logto-io/logto/issues/1212)) ([be56c75](https://github.com/logto-io/logto/commit/be56c75293e34b7ce08da1f8d294080ddcf3d81f))
* **console:** fix platform label prefix caused by merge ([#1049](https://github.com/logto-io/logto/issues/1049)) ([1dffcd2](https://github.com/logto-io/logto/commit/1dffcd2d09d32683f23aa8c4dd9f5f030567a5e7))
* **console:** fix SIE title padding ([#1211](https://github.com/logto-io/logto/issues/1211)) ([ca77a41](https://github.com/logto-io/logto/commit/ca77a41973b8719df3182304851fc6657d9063dd))
* **console:** get-started progress style ([#1343](https://github.com/logto-io/logto/issues/1343)) ([67a87bb](https://github.com/logto-io/logto/commit/67a87bb651d02af0c22e34f23c29c1f4f8cf2810))
* **console:** hide split line when username is empty ([#949](https://github.com/logto-io/logto/issues/949)) ([d8c8c04](https://github.com/logto-io/logto/commit/d8c8c041b980d7bb700b9b6043c62a1213bedc68))
* **console:** hide url input on terms of use disabled ([#1270](https://github.com/logto-io/logto/issues/1270)) ([1e6ad9f](https://github.com/logto-io/logto/commit/1e6ad9f15f0ce3de577033e1b59c2b25f460adec))
* **console:** hide user column ([#1296](https://github.com/logto-io/logto/issues/1296)) ([9b19b0e](https://github.com/logto-io/logto/commit/9b19b0e970b0c54d26b1ad59fe242672f6573f86))
* **console:** icon colors on the action menu ([#1179](https://github.com/logto-io/logto/issues/1179)) ([d71c18c](https://github.com/logto-io/logto/commit/d71c18c83c4065b28213ca93ae514a59879192de))
* **console:** icons in item preview should not be shrinked ([#1234](https://github.com/logto-io/logto/issues/1234)) ([2d66302](https://github.com/logto-io/logto/commit/2d663025ecbd08dc39878e2fd32cfb08b92e9b3a))
* **console:** improve horizontal scrollbar thumb styles ([818b1d7](https://github.com/logto-io/logto/commit/818b1d7cc78fb89060b23e3578b30fd20b6f2393))
* **console:** improve swr error handling to avoid app crash ([da77a1d](https://github.com/logto-io/logto/commit/da77a1d1b5c49f2e806bf0d5f27e326e081f1735))
* **console:** item preview alignment ([#1159](https://github.com/logto-io/logto/issues/1159)) ([5c43da2](https://github.com/logto-io/logto/commit/5c43da2201db8dbb4b782563fd37cad655326cad))
* **console:** jump to enabled connector ([#1225](https://github.com/logto-io/logto/issues/1225)) ([833436a](https://github.com/logto-io/logto/commit/833436ad157a8630d5839759644566df463fc80d))
* **console:** last button in guide should be primary type ([2036570](https://github.com/logto-io/logto/commit/2036570714a8fefa4dc959469f8fa9780ae312a5))
* **console:** limit preview options ([#1203](https://github.com/logto-io/logto/issues/1203)) ([4d16131](https://github.com/logto-io/logto/commit/4d16131b0cd62791ac62c5a274018eea3c9b1f9f))
* **console:** long text should wrap in code editor ([cbe2497](https://github.com/logto-io/logto/commit/cbe2497504322c81603317cbf2cc14f9ea45e103))
* **console:** misc improvements and ui fixes ([b653478](https://github.com/logto-io/logto/commit/b6534788416a4f837e2d13a9a6b6ecc2766f9a1b))
* **console:** move save changes into form ([#712](https://github.com/logto-io/logto/issues/712)) ([aed7442](https://github.com/logto-io/logto/commit/aed7442b32c3908d5ccdf14b096789564aba4bad))
* **console:** mutate settings after SIE guide done ([#1198](https://github.com/logto-io/logto/issues/1198)) ([ee2578b](https://github.com/logto-io/logto/commit/ee2578b6a1d7ab43f9076f301c114b04fedb4403))
* **console:** new platform tab colors ([#1158](https://github.com/logto-io/logto/issues/1158)) ([1bb770f](https://github.com/logto-io/logto/commit/1bb770fd1fa364f12c1c56a8542d36a3cf9647fe))
* **console:** new ui in save changes footer ([#661](https://github.com/logto-io/logto/issues/661)) ([19b9db8](https://github.com/logto-io/logto/commit/19b9db809ac5d66b935ee19dee0c2b83ebbf039a))
* **console:** only check demo app existence on get-started page ([e8ef4b6](https://github.com/logto-io/logto/commit/e8ef4b650ccc6db3d97b815f8c3d61db5a6c33f1))
* **console:** only show enabled connectors in table ([#1156](https://github.com/logto-io/logto/issues/1156)) ([4dbeb22](https://github.com/logto-io/logto/commit/4dbeb22fb6bbb901af3b62bb9fe7241dd9192426))
* **console:** open new tab for setup connectors ([#843](https://github.com/logto-io/logto/issues/843)) ([070a52c](https://github.com/logto-io/logto/commit/070a52c60abbebfdc42b9e9552096d1d27baae99))
* **console:** others form height in SIE ([#1210](https://github.com/logto-io/logto/issues/1210)) ([8d2f88b](https://github.com/logto-io/logto/commit/8d2f88b96d5814d31ac9871203e69bc640a44f1b))
* **console:** page content should not jump on scrollbar present ([#1306](https://github.com/logto-io/logto/issues/1306)) ([6d5a4f8](https://github.com/logto-io/logto/commit/6d5a4f8aebd3be882eab2bffb06b5947cb053c76))
* **console:** pass enabled connectors to preview ([#1209](https://github.com/logto-io/logto/issues/1209)) ([ac74309](https://github.com/logto-io/logto/commit/ac74309414c5509ab9a65b82b815487b99515328))
* **console:** prevent autofill background color ([#749](https://github.com/logto-io/logto/issues/749)) ([0f5491b](https://github.com/logto-io/logto/commit/0f5491b392418f7a1cd6418f15eef0176b0784d2))
* **console:** prevent cell overflow for user table ([#1215](https://github.com/logto-io/logto/issues/1215)) ([f5de519](https://github.com/logto-io/logto/commit/f5de5196fb24bfaf1c2bc304cedd7ac52fee49da))
* **console:** preview mobile device color ([#958](https://github.com/logto-io/logto/issues/958)) ([49b7908](https://github.com/logto-io/logto/commit/49b7908fb88420603af201afbc9c9b7ccc0feaeb))
* **console:** read-only text field background color should use color-layer-2 ([#1154](https://github.com/logto-io/logto/issues/1154)) ([ac99c26](https://github.com/logto-io/logto/commit/ac99c26181a013c449237b3c53e468330866cce9))
* **console:** reduce refresh frequency in preview ([#950](https://github.com/logto-io/logto/issues/950)) ([b61f70f](https://github.com/logto-io/logto/commit/b61f70fe01964fd1b9f0da6bbefc1cb099addf5c))
* **console:** reduce welcome image size ([#844](https://github.com/logto-io/logto/issues/844)) ([977b75b](https://github.com/logto-io/logto/commit/977b75b85822564de99674335e0dd23329817494))
* **console:** remove dashboard tip time range ([#1323](https://github.com/logto-io/logto/issues/1323)) ([3aac771](https://github.com/logto-io/logto/commit/3aac771f35bf2bda49c56f878f0823f3904028bb))
* **console:** remove plain copytoclipboard padding ([#675](https://github.com/logto-io/logto/issues/675)) ([e7faf32](https://github.com/logto-io/logto/commit/e7faf32b5fdb2e05ae919b2f4346a4c76abda0a0))
* **console:** remove redundant `required` label ([#1030](https://github.com/logto-io/logto/issues/1030)) ([248e43d](https://github.com/logto-io/logto/commit/248e43d7c955163dd5d11170aa8b951edc368741))
* **console:** remove role edit from user details ([#1173](https://github.com/logto-io/logto/issues/1173)) ([520f66c](https://github.com/logto-io/logto/commit/520f66cf3cae3b4d03e4c71f70df526a47bbc111))
* **console:** remove sign in methods form fields in guilde ([#1174](https://github.com/logto-io/logto/issues/1174)) ([e0be4fe](https://github.com/logto-io/logto/commit/e0be4fed37fca22c8c7d8e9092b84e7c215aafc6))
* **console:** remove text input error state from delete form ([#1302](https://github.com/logto-io/logto/issues/1302)) ([9e67e59](https://github.com/logto-io/logto/commit/9e67e59ff5ebd1bff4b81101610bfd2532dea511))
* **console:** remove the close button from toast ([#1318](https://github.com/logto-io/logto/issues/1318)) ([40c8d0e](https://github.com/logto-io/logto/commit/40c8d0eeed558e73bb7d574ec92cf89e30b41d54))
* **console:** remove underline in the empty table ([#1180](https://github.com/logto-io/logto/issues/1180)) ([1704f57](https://github.com/logto-io/logto/commit/1704f57aad017c375967dde981091df1f234f3e7))
* **console:** remove unused api resource help button ([#1217](https://github.com/logto-io/logto/issues/1217)) ([e5249e2](https://github.com/logto-io/logto/commit/e5249e2f8cc373dec32a0db1f67e6f1d7a252271))
* **console:** reset password label ([#1300](https://github.com/logto-io/logto/issues/1300)) ([628ac46](https://github.com/logto-io/logto/commit/628ac46a892095bb4be458da5b9c50a8935205ea))
* **console:** resolve js warning reported in code editor component ([c5d1488](https://github.com/logto-io/logto/commit/c5d14887d4bec2d0b1cfd3c39a858f13ba2c647f))
* **console:** return to user-details page from user-log-details page ([#1135](https://github.com/logto-io/logto/issues/1135)) ([294c600](https://github.com/logto-io/logto/commit/294c60062e07d3a3f56a281e6a39a98aa3d92eb8))
* **console:** save changes button on settings page ([#1167](https://github.com/logto-io/logto/issues/1167)) ([97faade](https://github.com/logto-io/logto/commit/97faade141e070bac861700a488417231820233d))
* **console:** sdk selector content in the guide should be left-aligned ([#1316](https://github.com/logto-io/logto/issues/1316)) ([99cd56f](https://github.com/logto-io/logto/commit/99cd56f96357945e2fc118795ebf5811902ebfdf))
* **console:** select the old primary sign-in method when the primary method change ([#1062](https://github.com/logto-io/logto/issues/1062)) ([b2b7189](https://github.com/logto-io/logto/commit/b2b71898d3eb76b675669347cc4c5df7ea07c999))
* **console:** set input type in connector tester ([#1160](https://github.com/logto-io/logto/issues/1160)) ([25e94a4](https://github.com/logto-io/logto/commit/25e94a4359139f7cf4515ba606c325e6243db917))
* **console:** set preview desktop background color ([#1292](https://github.com/logto-io/logto/issues/1292)) ([a1726d5](https://github.com/logto-io/logto/commit/a1726d58b5f425b96ce25732a76bda1330f79a2e))
* **console:** set switch default value to false ([#1197](https://github.com/logto-io/logto/issues/1197)) ([f9f646c](https://github.com/logto-io/logto/commit/f9f646c42057a5535d8fb0a5eab48f70491d5151))
* **console:** should not append slash in cors allowed uri ([#1001](https://github.com/logto-io/logto/issues/1001)) ([826f368](https://github.com/logto-io/logto/commit/826f368768c1f98e5f7316dce3f90d9c945c987a))
* **console:** should return to previous page when on sign-in-experience and app details page ([#1137](https://github.com/logto-io/logto/issues/1137)) ([ae0caa8](https://github.com/logto-io/logto/commit/ae0caa8f8b38a6ca46164c26ee5ea9b7ad7bd8d3))
* **console:** show enabled platforms in detail tab ([#989](https://github.com/logto-io/logto/issues/989)) ([0656b6d](https://github.com/logto-io/logto/commit/0656b6d67d398e67253e2992d48273f3ebe314c1))
* **console:** show user id in users table ([#1269](https://github.com/logto-io/logto/issues/1269)) ([7d5dd1a](https://github.com/logto-io/logto/commit/7d5dd1a9c66d427d3019ef595a4ac95fb0da5119))
* **console:** sie guide skip ([#1271](https://github.com/logto-io/logto/issues/1271)) ([8dedd9d](https://github.com/logto-io/logto/commit/8dedd9dae17504908b9a00a80f5d2c8ecde322ad))
* **console:** sign in exp layout ([#1142](https://github.com/logto-io/logto/issues/1142)) ([3668b66](https://github.com/logto-io/logto/commit/3668b6640f593eafd6512de5b73354c1f836aae6))
* **console:** sms and email connector in use status ([#1161](https://github.com/logto-io/logto/issues/1161)) ([a868c1f](https://github.com/logto-io/logto/commit/a868c1ff63e8400c57b393262a70de1f83c54987))
* **console:** socialConnectors in preview data ([#862](https://github.com/logto-io/logto/issues/862)) ([a2cd983](https://github.com/logto-io/logto/commit/a2cd983d97097f86a07f988031b76665958ac24b))
* **console:** special application name for admin console ([#997](https://github.com/logto-io/logto/issues/997)) ([a0ff900](https://github.com/logto-io/logto/commit/a0ff90058ca90f624a5e3a97bce1bb6b64d02fb6))
* **console:** stop swr retry on error 401 and 403 ([db59e3c](https://github.com/logto-io/logto/commit/db59e3c6d73ada32f1f712cafff984d1e981efd0))
* **console:** text field style in settings ([#739](https://github.com/logto-io/logto/issues/739)) ([890028d](https://github.com/logto-io/logto/commit/890028d937d740e63fb23b8e2b81a1fa44b0731c))
* **console:** text input autofill styles ([e8a433d](https://github.com/logto-io/logto/commit/e8a433d1e58eadb84479f06d6d38fb0e8b648868))
* **console:** tip icon color ([#805](https://github.com/logto-io/logto/issues/805)) ([5b2fe32](https://github.com/logto-io/logto/commit/5b2fe3291949dfbbf83a706ff8bd4eeb0dcff005))
* **console:** tooltip vertical offset ([#1169](https://github.com/logto-io/logto/issues/1169)) ([99090e3](https://github.com/logto-io/logto/commit/99090e3144fbd07eb39960819cb92b98b3947298))
* **console:** typo ([#810](https://github.com/logto-io/logto/issues/810)) ([bc19a29](https://github.com/logto-io/logto/commit/bc19a298f82b4d8ee7c9dfd7382e21e22d3d48da))
* **console:** ui fixes ([#678](https://github.com/logto-io/logto/issues/678)) ([dc976d8](https://github.com/logto-io/logto/commit/dc976d8248032b7a6d47a45f709cd82711db37de))
* **console:** update en phrases ([#1254](https://github.com/logto-io/logto/issues/1254)) ([a907ab4](https://github.com/logto-io/logto/commit/a907ab45fcbcc6ff6af45725858269e5b66354df))
* **console:** update get-started enable passwordless button text to "Enable" ([f7d2e4c](https://github.com/logto-io/logto/commit/f7d2e4cbd448356396788e127a8d8b6c03409387))
* **console:** update shadow styles ([#813](https://github.com/logto-io/logto/issues/813)) ([2e410e7](https://github.com/logto-io/logto/commit/2e410e7c168486db29909ef304dff63c2877a9a8))
* **console:** update terms of use ([#1122](https://github.com/logto-io/logto/issues/1122)) ([9262a6f](https://github.com/logto-io/logto/commit/9262a6f3beb7c2c46708453ce7d667dc5b39da8e))
* **console:** update user data ([#1184](https://github.com/logto-io/logto/issues/1184)) ([a3d3a79](https://github.com/logto-io/logto/commit/a3d3a79dd9c93c2bd23af78da1eb45de81642c3f))
* **console:** upgrade react-sdk 0.1.7 ([a814e2c](https://github.com/logto-io/logto/commit/a814e2c829b5219da2b8299f9e78aa2c13d123a8))
* **console:** use box shadow on radio group item hovered ([#1321](https://github.com/logto-io/logto/issues/1321)) ([953e7c6](https://github.com/logto-io/logto/commit/953e7c69777c96b3b32b0fe4e53de2fa2123c43b))
* **console:** use custom icon in date input ([#1172](https://github.com/logto-io/logto/issues/1172)) ([43711f2](https://github.com/logto-io/logto/commit/43711f234dfed94461272b0bd625a36886b5d73b))
* **console:** use native color picker style ([#819](https://github.com/logto-io/logto/issues/819)) ([628e025](https://github.com/logto-io/logto/commit/628e025a15d22bd11708f2dee8176d0f53ad8f2a))
* **console:** use small size dropdown in sign in experience preview ([#1083](https://github.com/logto-io/logto/issues/1083)) ([407bd6f](https://github.com/logto-io/logto/commit/407bd6f5bf1c70c7f7d87931008960d378757602))
* **console:** user connector table bottom line ([#1037](https://github.com/logto-io/logto/issues/1037)) ([f94a3f8](https://github.com/logto-io/logto/commit/f94a3f84c6cd14e2d36bc1d3a39d182beb5017ba))
* **console:** user connectors name ([#1164](https://github.com/logto-io/logto/issues/1164)) ([d36a7ab](https://github.com/logto-io/logto/commit/d36a7ab2420202b3a346e883d1aa9c939bf8e66b))
* **console:** user details card footer ([#1175](https://github.com/logto-io/logto/issues/1175)) ([7fb88f2](https://github.com/logto-io/logto/commit/7fb88f20fc58734fc4ce1a7ffdd8f53a0f0ba260))
* **console:** user management search result ([#1130](https://github.com/logto-io/logto/issues/1130)) ([3a814a6](https://github.com/logto-io/logto/commit/3a814a674633da8b250b62348025bb5d8d623bd4))
* **console:** wrap connector id with copytoclipboard ([#1025](https://github.com/logto-io/logto/issues/1025)) ([dfc51b6](https://github.com/logto-io/logto/commit/dfc51b6af757f0d9863a3de1d857fd81a5e6b28b))
* **console:** wrap routes with appcontent ([#1052](https://github.com/logto-io/logto/issues/1052)) ([88e2120](https://github.com/logto-io/logto/commit/88e2120e254e23fc150065be16519feb5ff08b27))
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
* deps ([2715383](https://github.com/logto-io/logto/commit/2715383ca25b2674611fcd7a882b5de3528b7bbb))
* **github:** fix the way of parsing github getAccessToken response ([#1094](https://github.com/logto-io/logto/issues/1094)) ([5516e18](https://github.com/logto-io/logto/commit/5516e18fe112626cf055a0d0e3add696fc11adf5))
* lockfile ([#694](https://github.com/logto-io/logto/issues/694)) ([8b22cf4](https://github.com/logto-io/logto/commit/8b22cf4c8976ed0f19bdffb55704aa5a30450671))
* revert "chore(deps): update parcel monorepo to v2.6.0" ([877bbc0](https://github.com/logto-io/logto/commit/877bbc0d2c5c0559a3fc9a8e801a13ebff2292a6))
* revert "refactor(console): handle user navigates to 'callback' after authenticated" ([8584680](https://github.com/logto-io/logto/commit/858468037c7e4db896b10cba228efe279f4c9c26))
* **schemas:** remove user foreign key on application id ([#964](https://github.com/logto-io/logto/issues/964)) ([9d8ef76](https://github.com/logto-io/logto/commit/9d8ef7632b2d1d2094eae1b232eba334342e5d74))
* **ui:** add body background color ([#831](https://github.com/logto-io/logto/issues/831)) ([be8b862](https://github.com/logto-io/logto/commit/be8b8628ba345bd8f8832b2123a43e70c236406d))
* **ui:** add default success true for no response api ([#842](https://github.com/logto-io/logto/issues/842)) ([88600c0](https://github.com/logto-io/logto/commit/88600c012c892c969f1e5df7ec5f46874513a058))
* **ui:** add i18n formater for zh-CN list ([#1009](https://github.com/logto-io/logto/issues/1009)) ([ca5c8aa](https://github.com/logto-io/logto/commit/ca5c8aaec1db7ffc330f50fcdc14400e06ad6f54))
* **ui:** add missing ui codecov job ([#1183](https://github.com/logto-io/logto/issues/1183)) ([d2bf19b](https://github.com/logto-io/logto/commit/d2bf19b12deefbbdcde5a1ebdf1f77f1655091c1))
* **ui:** catch request exceptions with no response body ([#790](https://github.com/logto-io/logto/issues/790)) ([48de9c0](https://github.com/logto-io/logto/commit/48de9c072bb060f3e5aeb785d7a765a66a0912fe))
* **ui:** fix callback link params for apple ([#985](https://github.com/logto-io/logto/issues/985)) ([362c3a6](https://github.com/logto-io/logto/commit/362c3a6e6ed3cab24a85f9e268509d31430609e4))
* **ui:** fix ci fail ([#708](https://github.com/logto-io/logto/issues/708)) ([da49812](https://github.com/logto-io/logto/commit/da4981216452ee11cf91c8f52a1d50ef18f9a37f))
* **UI:** fix connector target and id used in UI ([#838](https://github.com/logto-io/logto/issues/838)) ([cd46505](https://github.com/logto-io/logto/commit/cd4650508f9b1b4d2051e600afdf1e157dcf0631))
* **ui:** fix count down bug ([#874](https://github.com/logto-io/logto/issues/874)) ([9c1e9ef](https://github.com/logto-io/logto/commit/9c1e9ef7edb39d5d15dcbb21a8789fab78326de5))
* **ui:** fix create account page reload issue ([#832](https://github.com/logto-io/logto/issues/832)) ([e221758](https://github.com/logto-io/logto/commit/e2217584a40098d6bfcd6a745e8e0d982e8936c0))
* **ui:** fix drawer overflow bug ([#984](https://github.com/logto-io/logto/issues/984)) ([b9131e9](https://github.com/logto-io/logto/commit/b9131e97659dece341ba4dd0cb47686a24698dcb))
* **ui:** fix sign-in not found bug ([#841](https://github.com/logto-io/logto/issues/841)) ([5d34442](https://github.com/logto-io/logto/commit/5d34442018d0577ff3f90d57008d2af5d4f5b54b))
* **ui:** fix social bug ([#939](https://github.com/logto-io/logto/issues/939)) ([7a17d41](https://github.com/logto-io/logto/commit/7a17d41acf7cc068d0ec5568bcd842db51aa8b39))
* **ui:** fix social native interaction bug ([#772](https://github.com/logto-io/logto/issues/772)) ([2161856](https://github.com/logto-io/logto/commit/2161856bcd33b66c8390b343cc3591ff284be286))
* **ui:** fix some of the bug bash issues ([#1053](https://github.com/logto-io/logto/issues/1053)) ([db1b6d2](https://github.com/logto-io/logto/commit/db1b6d247a3d07f81ff1284b1fdbd3e7ffcc97aa))
* **ui:** fix typo ([#792](https://github.com/logto-io/logto/issues/792)) ([13cd2c1](https://github.com/logto-io/logto/commit/13cd2c100ed32b40da72364d1f4685edd7d6d25a))
* **ui:** fix ui i18n package error ([#713](https://github.com/logto-io/logto/issues/713)) ([34d798b](https://github.com/logto-io/logto/commit/34d798b645f16aff05b3818797b7914b5d2bc9b3))
* **ui:** fix undefined dark-primary-color bug ([#876](https://github.com/logto-io/logto/issues/876)) ([542d878](https://github.com/logto-io/logto/commit/542d878231b98710af6e5a8ba6a5a5f74eee73a3))
* **ui:** hide social signin method if connectors are empty ([#909](https://github.com/logto-io/logto/issues/909)) ([5e0c39e](https://github.com/logto-io/logto/commit/5e0c39e5166072c2c8d729c2e0f714507fd93ba6))
* **ui:** input fields ([#1125](https://github.com/logto-io/logto/issues/1125)) ([20f7ad9](https://github.com/logto-io/logto/commit/20f7ad986353eb0026cbec417eaed3c334279f86))
* **ui:** relocate svg jest config ([#856](https://github.com/logto-io/logto/issues/856)) ([d8c62c1](https://github.com/logto-io/logto/commit/d8c62c14a677d9afa8ce4b2c78cdd8fc8b1ee6c1))
* **ui:** social bind account should back to sign-in page ([#952](https://github.com/logto-io/logto/issues/952)) ([da41369](https://github.com/logto-io/logto/commit/da41369bfd0e444190d33edef6527b32b538dbee))
* **ui:** ui design review fix ([#697](https://github.com/logto-io/logto/issues/697)) ([15dd1a7](https://github.com/logto-io/logto/commit/15dd1a767e9eddfd37a80b47775afbe327b76d5b))
* **ui:** ui refinement ([#855](https://github.com/logto-io/logto/issues/855)) ([1661c81](https://github.com/logto-io/logto/commit/1661c8121a9ed1620a4d8fefd51523d2be261089))
* **ut:** fix ut ([#683](https://github.com/logto-io/logto/issues/683)) ([b0138bd](https://github.com/logto-io/logto/commit/b0138bdc0f2c43f40e20e83b621f3de3d068c171))
* **worklow:** add master codecov report job ([#1189](https://github.com/logto-io/logto/issues/1189)) ([67613ae](https://github.com/logto-io/logto/commit/67613aec7a03c2786d62b8a366850133c1ab3449))
