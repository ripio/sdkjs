## What is Ripio SDK js?

Ripio SDK js is a library written in javascript that allows you to interact with any EVM. As a main feature, Ripio SDK grants simplicity in writing code to transact on blockchain. It has 3 layers of abstraction that goes from, the most generic in terms of interaction with Smart Contracts, to a more oriented design for each of the use cases/industries where you can develop a dApp.

Ripio SDK js uses [Ethers js](https://docs.ethers.io/v5/) to perform the interaction with the blockchain while simplifying its use. Also Ripio SDK uses [ipfs-http-client](https://www.npmjs.com/package/ipfs-http-client) to be able to interact with the InterPlanetary File System (IPFS - a protocol, hypermedia and file sharing peer-to-peer network for storing and sharing data in a distributed file system).

## Architecture

Ripio SDK has several layers of abstraction that range from the most generic in terms of interaction with Smart Contracts to a design more oriented to each of the industries where a dApp can be developed.

Contract Layer: This set of classes allows developers to interact with the blockchain using few lines of code. It also allows you to execute transactions with any type of smart contract.

Standard Layer: Contains a set of classes that allow developers to interact more clearly with many of the ERC standards (e.g. ERC20, ERC721). It also makes it easier to perform some tasks associated with this type of contract.

Gaming Layer (work in progress): set of classes that represent specific functionalities of a use case, in this particular case gaming. The game developer can interact only with these classes in the layer without getting involved with contracts or ERCs. The game developer can increase functionality by inheriting from any of these classes.

### Resources

- [sdk](https://ripio.github.io/sdkjs/sdk)
- [sdk nft](https://ripio.github.io/sdkjs/sdk-nft)
- [sdk storage aws](https://ripio.github.io/sdkjs/sdk-storage-aws)
- [sdk storage http](https://ripio.github.io/sdkjs/sdk-storage-http)
- [sdk storage ipfs](https://ripio.github.io/sdkjs/sdk-storage-ipfs)
- [sdk modal connector](https://ripio.github.io/sdkjs/sdk-modal-connector)
