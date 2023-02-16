## Installation

To install ripio sdk we recommend node 16 or above, although it might work with lower versions.

```
npm i @ripio/sdk
```

## Overview

### Connectors

Connectors are classes that allow you to interact with the blockchain by wrapping up the account and provider. The connectors provide you with the ability to interact with the RPC API and they work as a bridge between Manager classes and the blockchain (see: Managers documentation section)

The following classes are exported on the connectors submodule for CommonJS:

```javascript
const { BrowserWeb3Connector, JsonRPCWeb3Connector } = require('@ripio/sdk/connectors');
```

For TypeScript import them from the origin (submodules will come in the near future):

```javascript
import { BrowserWeb3Connector, JsonRPCWeb3Connector } from '@ripio/sdk';
```

BrowserWeb3Connector | This class uses an injected web3 browser extension (e.g. Metamask) to connect to the Blockchain and provide the user with the ability to sign transactions. This connector provides the functionality to switch and add chains to the web3 browser extension as well as to sign messages.
-- | --
JsonRPCWeb3Connector | The JSON-RPC API is another popular method for interacting with EVM Blockchain and is available in all major Ethereum node implementations as well as many third-party web services (e.g. INFURA). To use this connector, you must provide a url of the EVM node to connect to and private key with which the transactions will be signed (it can be ignored if you only want a read-only connection).

Sometimes it is necessary to have a connector instance to perform certain tasks. It is possible to instantiate a BrowserWeb3Connector and JsonRPCWeb3Connector and they must be activated as well. Also, those instances can be used in activation of a ContractManager (see: Contract Manager activation section).

#### BrowserWeb3Connector

When activating the BrowserWeb3Connector a web3 browser extension is required to inject on window.ethereum a Web3 Provider:

```javascript
const connector = new BrowserWeb3Connector();
const {chainId, provider, account} = await connector.activate();
```

Is a good idea to deactivate the connector when you are not going to use it anymore or your program ends. To remove any listeners to events that are still active.

```javascript
await connector.deactivate();
```

#### JsonRPCWeb3Conector

When activating the JsonRPCWeb3Connector the Json RPC url is required to connect to the blockchain, and an optional private key can be passed to be able to sing transactions or messages:

```javascript
const WSS = 'JSON-RPC-API-URL'
const PRIVATE_KEY = '...';
const connector = new JsonRPCWeb3Connector(WSS, PRIVATE_KEY);
const {chainId, provider, account} = await connector.activate();
```

With this connector you could also deactivate it after finishing working with it or before your program ends to remove any listeners to events that are still active. We strongly recommend doing it when you are using a websocket provider.

```javascript
await connector.deactivate();
```

### Shared functionality:

The connectors share the following functionalities:

- Sign messages:

```javascript
const message = “The answer to life, the universe and everything.”;
await connector.signMessage(message); '0x058...91c'
```

- Obtain transaction data:

```javascript
const txHash = “0xf3c...586”;
await connector.getTransaction(txHash);
{
    hash: '0x4ad...f4a',
    type: 0,
    accessList: null,
    blockHash: '0x749...469',
    blockNumber: 2641,
    transactionIndex: 0,
    confirmations: 6,
    from: '0xB19...048D',
    gasPrice: BigNumber { _hex: '0x00', _isBigNumber: true },
    gasLimit: BigNumber { _hex: '0x6691b7', _isBigNumber: true },
    to: '0xd2e...222',
    value: BigNumber { _hex: '0x00', _isBigNumber: true },
    nonce: 239,
    data: '0x162...000',
    r: '0x3e4...07c',
    s: '0x60c...c5c',
    v: 42,
    creates: null,
    chainId: 1,
    wait: [Function (anonymous)]
}
```

- Obtain native chain balance:

```javascript
await connector.getBalance(“0x5dB...36b”);
‘84.4242’
```

- Transfer native chain balance:

```javascript
await connector.transferBalance("1", "0x5dB...36b");
{ 
    chainId: 1337, 
    confirmations: 0, 
    data: '0x', 
    from: '0x8577181F3D8A38a532Ef8F3D6Fd9a31baE73b1EA', 
    gasLimit: { BigNumber: "21000" }, 
    gasPrice: { BigNumber: "1" }, 
    hash: '0xdbf6b710ded42ae0fcfb0ec601235afce5acd0a01b785002cf0581fab4d53b52', 
    nonce: 5, 
    r: '0x7502ebb9c10e1664d9a344b636c1151a9ebc6b9dd1aa2bad9f739d15368a83f9', 
    s: '0x3a71b2b3a2a90527e2cf221606b89af5ac8195b8146f9d2776e4ca342b7e37b2', 
    to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72', 
    type: null, 
    v: 2710, 
    value: { BigNumber: "1000000000000000000" }, 
    wait: [Function], 
    cancel: [Function: cancelTransaction], 
    speedUp: [Function: speedUpTransaction], 
    change: [Function: changeBalanceTransaction]
}
```

- Change balance transfer on native chain:

```javascript
const to = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
const value = BigNumber { _hex: '0xDE0B6B3A7640000', _isBigNumber: true };
const gasSpeed = BigNumber { _hex: '0x01', _isBigNumber: true };
const txResponse = await connector.transferBalance("1", "0x5dB...36b");
await connector.changeBalanceTransaction(txResponse, to, value, gasSpeed);
{ 
    chainId: 1337, 
    confirmations: 0, 
    data: '0x', 
    from: '0x8577181F3D8A38a532Ef8F3D6Fd9a31baE73b1EA', 
    gasLimit: { BigNumber: "21000" }, 
    gasPrice: { BigNumber: "1" }, 
    hash: '0xdbf6b710ded42ae0fcfb0ec601235afce5acd0a01b785002cf0581fab4d53b52', 
    nonce: 5, 
    r: '0x7502ebb9c10e1664d9a344b636c1151a9ebc6b9dd1aa2bad9f739d15368a83f9', 
    s: '0x3a71b2b3a2a90527e2cf221606b89af5ac8195b8146f9d2776e4ca342b7e37b2', 
    to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72', 
    type: null, 
    v: 2710, 
    value: { BigNumber: "1000000000000000000" }, 
    wait: [Function]
}
```

- Sign typed data:

```javascript
const domain = {
    name: “ContractName”,
    version: '1',
    chainId: “100”,
    verifyingContract: “0x123...789”}
const value = “0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff”; 
const deadline = “0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff”; 
const nonce = “0x0000000000000000000000000000000000000000000000000000000000000000”;
const message = {
    owner: “0x123...888”,
    spender: “0x123...999”,
    value,
    nonce,
    deadline
}
const signer = new EIP2612PermitTypedDataSigner(domain, message);
await connector.signTypedData(signer);
{
    r: '0xff406d8a920f957f867379275961a5ac94a7376c02c5b89e64f9715c6b4ff31f',
    s: '0x7bb422355272555eca2757411c9a127ce6260387558940715b51fca444b8edcd',
    _vs: '0xfbb422355272555eca2757411c9a127ce6260387558940715b51fca444b8edcd',
    recoveryParam: 1,
    v: 28,
    yParityAndS: '0xfbb422355272555eca2757411c9a127ce6260387558940715b51fca444b8edcd',
    compact: '0xff406d8a920f957f867379275961a5ac94a7376c02c5b89e64f9715c6b4ff31ffbb422355272555eca2757411c9a127ce6260387558940715b51fca444b8edcd'
}
```

### Managers

A ContractManager is an abstraction which represents a connection to a specific contract on the Blockchain, so that applications can interact with the contract methods and events.

To instantiate a ContractManager class it must be imported from the base export or the managers module.

```javascript
import { ContractManager } from ‘@ripio/sdk’;
// Or from managers module
import { ContractManager } from ‘@ripio/sdk/managers’;
const contract = new ContractManager();
```

The Contract Manager class allows you to interact with an on-chain contract regardless of the functions it contains. In order to use it, it must be activated.

```javascript
await contract.activate({
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI
});
```

The CONTRACT_ADDRESS parameter is the string address of a contract available on the blockchain which you want to interact with.

In order to communicate with the on-chain contract, this class needs to know what methods are available and the parameters that the functions require, which is what the CONTRACT_ABI parameter (Application Binary Interface, ABI) provides.

ABI Example:

```javascript
let abi = [
... 
 {
 "inputs": [],
 "name": "name",
 "outputs": [ 
    {
    "internalType": "string",
    "name": "",
    "type": "string"
    }
 ],
  "stateMutability": "view",
  "type": "function" 
 },
...
]
```

After activating the ContractManager instance you can make a call to a method of the instantiated contract by calling the ‘execute’ function provided by the manager class. The following example gets the result of calling a "name" method that returns a string value, in case that the method called does not exists on the contract’s ABI it will throw an error:

```javascript
await contract.execute({ method: “name” });
{
    value: ‘ContractName’,
    isTransaction: false
}
await contract.execute({
    method: ‘balanceOf’,
    params: [‘0x12...789’]
});
{
    value: BigNumber { _hex: '0x42', _isBigNumber: true },
    isTransaction: false
}
await contract.execute({
    method: ‘mint’,
    params: [ ‘0x12...789’ ],
    value: ‘1’, // paying 1 ether  
});
{
    value: {
        chainId: 1337,
        confirmations: 0,
        data: '0x',
        from: '0x8577181F3D8A38a532Ef8F3D6Fd9a31baE73b1EA',
        gasLimit: { BigNumber: "21000" },
        gasPrice: { BigNumber: "1" },
        hash: '0xdbf6b710ded42ae0fcfb0ec601235afce5acd0a01b785002cf0581fab4d53b52',
        nonce: 5,
        r: '0x7502ebb9c10e1664d9a344b636c1151a9ebc6b9dd1aa2bad9f739d15368a83f9',
        s: '0x3a71b2b3a2a90527e2cf221606b89af5ac8195b8146f9d2776e4ca342b7e37b2',
        to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        type: null,
        v: 2710,
        value: { BigNumber: "1000000000000000000" },
        wait: [Function],
        cancel: [Function: cancelTransaction],
        speedUp: [Function: speedUpTransaction],
        change: [Function: changeTransaction]
     },  
     isTransaction: true
}
```

In this case the function only returns a value. It does not sign any transaction (modify contract values). These cases will be shown in the following sections.

In case that an error occurs during the execution of the “execute” function, an error will be thrown, containing a generic error and the error that originated that exception. By catching the error with a try-catch statement, and inspecting the “cause” of the exception, you’ll be able to see what happened internally.

```javascript
// Let's assume that something goes wrong while calling the previous function. Be cautious and wrap it in a try-catch and inspect the error.
try {
    await contract.execute({
        method: ‘balanceOf’,
        params: [‘0x12...789’]
    });
} catch (error) {
    console.log(error);
    console.log(error.cause);
}
```

The following list are managers that follow the standards but can also be used with contracts that extend or implement them, whether standards or a particular design:


Token20Manager | It represents a standard ERC20 contract that implements a fungible token (a coin).
-- | --
NFT721Manager | It represents a standard ERC721 contract that implements non-fungible tokens (NFTs).

#### Token20Manager

In most cases you will want to instantiate a contract designed under an ERC standard (eg ERC20 for a fungible token contract). In that case you can instantiate the contract with a specific class of the mentioned standard:

```javascript
// commonJS
const { Token20Manager } = require('@ripio/sdk/managers');
// TS
import { Token20Manager } from '@ripio/sdk';
const contract = new Token20Manager();
```

The advantage of using a specific class from a standard is that the concrete functions are coded to be called directly:

```javascript
const contract = new Token20Manager();
const address = ‘0x123...789’
await contract.activate({
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI
});
const name = await contract.name();
const symbol = await contract.symbol();
const balance = await contract.balanceOf(address);
```

#### NFT721Manager

When working with NFTs it is recommended to use the NFT721Manager that follows the ERC721 standard (for a non fungible token contract). If that’s the case you can instantiate the manager of the mentioned standard:

```javascript
// commonJS
const { NFT721Manager } = require('@ripio/sdk/managers');
// TS
import { NFT721Manager } from '@ripio/sdk';

const contract = new NFT721Manager();

```

The advantage of using a specific class from a standard is that the concrete functions are coded to be called directly:

```javascript
const contract = new NFT721Manager();
const address = ‘0x123...789’
await contract.activate({
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI
});
const owner = ‘0x12...789’;
const spender = ‘0x23...678’;
const allowance = await contract.allowance(owner, spender);
const balance = await contract.balanceOf(address);
const totalSupply = await contract.totalSupply();
```

#### Activation

ContractManager and any class that represents a standard must be activated in order to be used. The activation process includes providing the ABI and the contract’s address on the blockchain. In addition to that, activation is important because it allows you to set up the connection to the Blockchain and the way in which transactions will be signed (except in read-only functions).
When you activate a ContractManager a connector is generated internally depending on the parameters provided in the activate method.

Activating a manager without parameters in addition to contractAddress and ABI generates a BrowserWeb3Connector, which will connect and sign transactions with the injected web3 browser extension:

```javascript
await contract.activate({
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI
});
```

On the other hand, if the Blockchain node URL is added, it will generate a JsonRPCWeb3Connector, which will connect without depending on any browser extension. In this case, the manager will be in read only mode(transactions cannot be signed):


```javascript
await contract.activate({
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI,
    providerWss: WSS
});
```

If a private key is added to this last call, it will generate a JsonRPCWeb3Connector, same as the previous one, but it will be possible to sign transactions using the private key provided.

```javascript
await contract.activate({
contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI,
    providerWss: WSS,
    privateKey: PRIVATE_KEY
});
```

Sometimes it is necessary to have a connector instance to perform certain tasks. It is possible to instantiate a BrowserWeb3Connector and JsonRPCWeb3Connector and they must be activated as well. Also, those instances can be used in activation of a ContractManager.

With BrowserWeb3Connector:

```javascript
let browserConn = new BrowserWeb3Connector();
let chain = await browserConn.activate();
await contract.activate({
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI,
    connector: browserConn
});
```

With JsonRPCWeb3Connector:

```javascript
let jsonRPCConn = new JsonRPCWeb3Connector(WSS, PRIVATE_KEY);
chain = await jsonRPCConn.activate();
await contract.activate({
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI,
    connector: jsonRPCConn
});
```

### Injected web3 interaction

When activating a BrowserWeb3Connector the web3 browser extension will receive a request that the user must approve so that the connector can operate on behalf of the connected account. If this request is rejected then the activation process will fail.

Once the BrowserWeb3Connector is active the following methods are available to be used:

- Add a new chain:

```javascript
const chainId = 100;
const chainName = ‘Ripio testnet’;
const rpcUrl = ‘https://testnet.ripio.com’;
const currencyName = ‘NAME’;
const currencySymbol = ‘SYMBOL’;
await connector.addChain(
    chainId,
    chainName,
    rpcUrl,
    currencyName,
    currencySymbol
);
```

- Request a chain switch:

```javascript
const chainId = 100;
await connector.switchChain(chainId);
```

An injected web3 provider will emit events so that the user can listen to them and act accordingly. To do that, the manager instances contain a [NodeJS EventEmitter](https://nodejs.org/api/events.html) that will be listening to these events, handling the changes and re-emitting them. The manager instances have methods for the user to create or delete listeners as follows:

```javascript
const manager = new ContractManager();
await manager.activate(...);
const event = ProviderEvents.CHAIN_CHANGED;
function listener(chainId){...}
// add a listener to a certain event
manager.on(event, listener);  // alias: addListener(...)
// add a one-time listener to a certain event
manager.once(event, listener);
// remove an event listener from an event
manager.off(event, listener); // alias: removeListener(...)
// remove all listeners for an event
manager.removeAllListeners(event?);
```

Once the manager gets activated with a BrowserWeb3Provider it will subscribe to the following injected web3 provider events so that the user can listen to them with the previous explained methods:

- CONNECT: 'connect' (Emits a ConnectInfo object).
- DISCONNECT: 'disconnect' (Emits a ProviderRpcError object).
- ACCOUNT_CHANGED: 'accountsChanged' (Emits a JsonRpcSigner or Wallet object).
- CHAIN_CHANGED: 'chainChanged' (Emits a number representing the chain Id).

### Transaction management

The manager instances have a safeMode, active by default, that will impact on the execute function by first executing the transaction with callStatic (this does not actually change any state, but is free). This can be used to determine if a transaction will fail or succeed.

When sending a transaction, this could be through the execute function of a manager instance or a transferBalance of a connector instance, the response obtained includes all properties of a Transaction as well as several properties that are useful once it has been mined, for example:

- wait(confirmations?):

An asynchronous function that receives the amount of confirmations to wait for before considering that the transaction has been included in the chain. It is recommended to use the getMinConfirmations function, it will return an amount based on the chainId being provided or a default value.

```javascript
const tx = await manager.execute(...);
const confirmations = getMinConfirmations(manager.connector.chainId);
await tx.transactionResponse.wait(confirmations); // amount of confirmations for the specific chain or a default value
const confirmations = 10;
await tx.transactionResponse.wait(confirmations); // 10 confirmations
```

- cancel(gasSpeed?):

An asynchronous function that cancels a transaction by sending a transaction with value 0, the same nonce and a higher fee. If no parameter was passed to the cancel function then it will use the speedUpPercentage value available on the connector class with a 10% default value.It can be canceled if the transaction is still in the mem pool, in case that the transaction was already mined then it will fail.

```javascript
const tx = await manager.execute(...);
const response = await tx.transactionResponse.cancel(); // default gas price 10% up
const gasSpeed = BigNumber.from(40);
const response = await tx.transactionResponse.cancel(gasSpeed);
```

- speedUp(gasSpeed?):

An asynchronous function that speeds up a transaction by re-sending it with a higher fee. If no parameter was passed to the speedUp function then it will use the speedUpPercentage value available on the connector class with a 10% default value. It can be speeded up if the transaction is still in the mem pool, in case that the transaction was already mined then it will fail.

```javascript
const tx = await manager.execute(...);
const response = await tx.transactionResponse.speedUp(); // default gas price 10% up
const gasSpeed = BigNumber.from(40);
const response = await tx.transactionResponse.speedUp(gasSpeed);
```

- change(newParams, gasSpeed?):

An asynchronous function that changes the transaction by repeating the execution of the same method but updating the parameters passed to the function with new ones. If no gasSpeed parameter was passed to the change function then it will use the speedUpPercentage value available on the connector class with a 10% default value. It can be changed if the transaction is still in the mem pool, in case that the transaction was already mined then it will fail.

```javascript
const tx = await manager.execute(...);
const response = await tx.transactionResponse.change({to: ‘0x...123’}); // default gas price 10% up
const gasSpeed = BigNumber.from(100);
const response = await tx.transactionResponse.change({to: ‘0x...123’}, gasSpeed);
```

### Utils and others

The utils submodule exports certain functionalities related to:

#### Connectors

- verifyMessage(nonce, signature, expectedAddress): It takes a nonce, a signature, and an expected address, and returns true if the signature is valid for the nonce and the expected address.

```javascript
// commonJS
const { connectorsUtils } = require('@ripio/sdk/utils');
// TS
import { connectorsUtils } from '@ripio/sdk';

const message = ‘Log in with nonce: 999’;
const expected = ‘0x12...789’
const signature = ‘abc...123’;
connectorsUtils.verifyMessage(message, signature, expected);
true

```

- getMinConfirmations(chainId): It returns the minimum number of confirmations required for a transaction to be considered valid for a specific chain.

```javascript
// commonJS
const { connectorsUtils } = require('@ripio/sdk/utils');
// TS
import { connectorsUtils } from '@ripio/sdk';

connectorsUtils.getMinConfirmations(100);
1
```


#### Conversions

- fromWei(value, unit): It takes a BigNumberish value and a unit and returns a string.

```javascript
// commonJS
const { conversions } = require('@ripio/sdk/utils');
const { enums } = require('@ripio/sdk/types');
// TS
import { conversions } from '@ripio/sdk';
import { enums } from '@ripio/sdk';

conversions.fromWei('1', enums.UnitTypes.ETHER);
'0.000000000000000001'
conversions.fromWei('1', enums.UnitTypes.WEI);
'1'

```

- toWei(value, unit): It converts a string value representing a unit type into WEI (BigNumber).

```javascript
// commonJS
const { conversions } = require('@ripio/sdk/utils');
const { enums } = require('@ripio/sdk/types');
// TS
import { conversions } from '@ripio/sdk';
import { enums } from '@ripio/sdk';

conversions.toWei('1', enums.UnitTypes.ETHER)BigNumber { _hex: '0x0de0b6b3a7640000', _isBigNumber: true }
conversions.toWei('1', enums.UnitTypes.WEI)BigNumber { _hex: '0x01', _isBigNumber: true }
conversions.toWei('1', enums.UnitTypes.ETHER).toString();
'1000000000000000000'
conversions.toWei('1', enums.UnitTypes.WEI).toString();
'1'
```

- numberToHex(num): It converts a number to a hex string (only integers).

```javascript
// commonJS
const { conversions } = require('@ripio/sdk/utils');
// TS
import { conversions } from '@ripio/sdk';

conversions.numberToHex(123);
‘0x7b’

```

- hexToNumber(hex): It takes a hexadecimal string and returns a number.

```javascript
// commonJS
const { conversions } = require('@ripio/sdk/utils');
// TS
import { conversions } from '@ripio/sdk';

conversions.hexToNumber(‘0x7b’);
123
```

### Other resources

- [sdk nft](https://ripio.github.io/sdkjs/sdk-nft)
- [sdk storage aws](https://ripio.github.io/sdkjs/sdk-storage-aws)
- [sdk storage http](https://ripio.github.io/sdkjs/sdk-storage-http)
- [sdk storage ipfs](https://ripio.github.io/sdkjs/sdk-storage-ipfs)