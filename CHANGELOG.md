# [1.1.0-dev.8](https://github.com/ripio/sdkjs/compare/v1.1.0-dev.7...v1.1.0-dev.8) (2022-11-02)


### Features

* add StorageHttp and ResourceHttp ([f7f99f2](https://github.com/ripio/sdkjs/commit/f7f99f2f551bd99effc1444c57453f72493a408f))

# [1.1.0-dev.7](https://github.com/ripio/sdkjs/compare/v1.1.0-dev.6...v1.1.0-dev.7) (2022-10-31)


### Features

* added aws implementation for storage and resource ([70a9d59](https://github.com/ripio/sdkjs/commit/70a9d59e749db9911d5d733fee5f76425f9dfaaf))
* changing resource from interface to abstract class ([77f1db0](https://github.com/ripio/sdkjs/commit/77f1db025a7196243858a23f43c8d50b15184f6f))

# [1.1.0-dev.6](https://github.com/ripio/sdkjs/compare/v1.1.0-dev.5...v1.1.0-dev.6) (2022-10-31)


### Features

* adding ResourceIpfs and StorageIpfs ([0647b9a](https://github.com/ripio/sdkjs/commit/0647b9af9c00dbf0b5e8b9c736e9d410445ed772))
* changing resource from interface to abstract class ([94faf2c](https://github.com/ripio/sdkjs/commit/94faf2c0a7e972e1f7fb29c27ce1ab31d0290ee9))

# [1.1.0-dev.5](https://github.com/ripio/sdkjs/compare/v1.1.0-dev.4...v1.1.0-dev.5) (2022-10-28)


### Features

* add nft class ([d8a73e2](https://github.com/ripio/sdkjs/commit/d8a73e295e813562b5faeb5489004920205dc8ab))

# [1.1.0-dev.4](https://github.com/ripio/sdkjs/compare/v1.1.0-dev.3...v1.1.0-dev.4) (2022-10-27)


### Features

* add StorageType and Resourse interfaces ([8606401](https://github.com/ripio/sdkjs/commit/8606401b7e02b618fb9b131453af7e4b9cfe6768))
* added changeBalanceTransaction on abstract connector to replace a transaction of a transfer balance ([35a4d56](https://github.com/ripio/sdkjs/commit/35a4d56293d1624f35b64478542f2a19a836b970))
* new interface for transferBalance response, new connectorResponse function for the transferBalance response (with change, speedUp, cancel methods), updated execute response interface (manager is mandatory) ([78814a8](https://github.com/ripio/sdkjs/commit/78814a88a4bb9425034d70ae0b0b30fb41d1cc9c))

# [1.1.0-dev.3](https://github.com/ripio/sdkjs/compare/v1.1.0-dev.2...v1.1.0-dev.3) (2022-10-26)


### Features

* add implements function to ContractManager ([7bdded6](https://github.com/ripio/sdkjs/commit/7bdded67aafefe1fa45436545c4652a24ba6b7d7))
* deprecate extended managers ([9869798](https://github.com/ripio/sdkjs/commit/9869798b93770f4d35d275b1a0e6e0fca9f2abfe))

# [1.1.0-dev.2](https://github.com/ripio/sdkjs/compare/v1.1.0-dev.1...v1.1.0-dev.2) (2022-10-25)


### Features

* Moving changeTransaction logic to ContractManager class. ([6510453](https://github.com/ripio/sdkjs/commit/65104532548c8e9267af7c89eed01787943fec5e))

# [1.1.0-dev.1](https://github.com/ripio/sdkjs/compare/v1.0.1...v1.1.0-dev.1) (2022-10-18)


### Features

* Add new override attributes on execute funtion ([14e193f](https://github.com/ripio/sdkjs/commit/14e193fbae84b561eaa28f8a16308931323f72fd))
* fix JsonRPC tests ([1bdbe57](https://github.com/ripio/sdkjs/commit/1bdbe571a22301f6117b518aab0def433a5d5d86))
* fix lint ([6a7dcc6](https://github.com/ripio/sdkjs/commit/6a7dcc6f8a76e425bb86d2a664990d82d3e8f276))
* fix lint ([895a0d9](https://github.com/ripio/sdkjs/commit/895a0d9229c57792d104710e53deb71b1372aba0))
* manage gas price on non legacy chains ([1770b68](https://github.com/ripio/sdkjs/commit/1770b687403310afe270c3af9b9482807ce37404))

## [1.0.1](https://github.com/ripio/sdkjs/compare/v1.0.0...v1.0.1) (2022-10-05)


### Bug Fixes

* ci dependency jobs and package lock ([1ecf9ef](https://github.com/ripio/sdkjs/commit/1ecf9efa92eb94227d331a84284e9a324a32fda3))
* removed dist from assets, added build command to ci release job ([53f46e4](https://github.com/ripio/sdkjs/commit/53f46e445300599a0b63760713082b5402e94d4d))
* run ci lint and test jobs in parallel ([cab7e2d](https://github.com/ripio/sdkjs/commit/cab7e2d3e3b02a87609b2d46e1c2528cc2e0c91e))

# 1.0.0 (2022-10-05)


### Features

* first commit/release ([a197a14](https://github.com/ripio/sdkjs/commit/a197a14b8920f1fac8ea1b5ceddc72b5a4187f6f))
