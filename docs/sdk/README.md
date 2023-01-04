## Installation

To install ripio sdk we recommend node 16 or above, although it might work with lower versions.

```
npm i @ripio/sdk
```

## Overview

### Connectors

Connectors are classes that allow you to interact with the blockchain by wrapping up the account and provider. The connectors provide you with the ability to interact with the RPC API and they work as a bridge between Manager classes and the blockchain (see: Managers documentation section)

The following classes are exported on the connectors submodule for CommonJS:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-5c478b7a-7fff-411c-cac3-0721a78ad487"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const { BrowserWeb3Connector, JsonRPCWeb3Connector } = require('@ripio/sdk/connectors');
```
</div><br /></b>

For TypeScript import them from the origin (submodules will come in the near future):

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-8fe1dba4-7fff-a801-b748-36b206eb6429"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
import { BrowserWeb3Connector, JsonRPCWeb3Connector } from '@ripio/sdk';
```
</div><br /></b>

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-4332e423-7fff-2aeb-d14b-17478f65a4f7"><div dir="ltr" style="margin-left:0pt;" align="left">
BrowserWeb3Connector | This class uses an injected web3 browser extension (e.g. Metamask) to connect to the Blockchain and provide the user with the ability to sign transactions. This connector provides the functionality to switch and add chains to the web3 browser extension as well as to sign messages.
-- | --
JsonRPCWeb3Connector | The JSON-RPC API is another popular method for interacting with EVM Blockchain and is available in all major Ethereum node implementations as well as many third-party web services (e.g. INFURA). To use this connector, you must provide a url of the EVM node to connect to and private key with which the transactions will be signed (it can be ignored if you only want a read-only connection).
</div><br /></b>

Sometimes it is necessary to have a connector instance to perform certain tasks. It is possible to instantiate a BrowserWeb3Connector and JsonRPCWeb3Connector and they must be activated as well. Also, those instances can be used in activation of a ContractManager (see: Contract Manager activation section).

#### BrowserWeb3Connector

When activating the BrowserWeb3Connector a web3 browser extension is required to inject on window.ethereum a Web3 Provider:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-5adfdf97-7fff-fb75-f6d7-a568b231665b"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const connector = new BrowserWeb3Connector();
const {chainId, provider, account} = await connector.activate();
```
</div><br /></b>

Is a good idea to deactivate the connector when you are not going to use it anymore or your program ends. To remove any listeners to events that are still active.

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-1b985b03-7fff-20e7-12d5-7c7c011f2039"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
await connector.deactivate();
```
</div><br /></b>

#### JsonRPCWeb3Conector

When activating the JsonRPCWeb3Connector the Json RPC url is required to connect to the blockchain, and an optional private key can be passed to be able to sing transactions or messages:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-9336761a-7fff-9964-6fcc-e6133eacd24a"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const WSS = 'JSON-RPC-API-URL'
const PRIVATE_KEY = '...';
const connector = new JsonRPCWeb3Connector(WSS, PRIVATE_KEY);
const {chainId, provider, account} = await connector.activate();
```
</div><br /></b>

With this connector you could also deactivate it after finishing working with it or before your program ends to remove any listeners to events that are still active. We strongly recommend doing it when you are using a websocket provider.

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-b736f776-7fff-7826-96cc-c8b0b21eb05f"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
await connector.deactivate();
```
</div><br /></b>

### Shared functionality:

The connectors share the following functionalities:

- Sign messages:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-57220e56-7fff-f416-cf85-c48465b0b469"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const message = “The answer to life, the universe and everything.”;
await connector.signMessage(message); '0x058...91c'
```
</div><br /></b>

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

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-f1f936e1-7fff-7c52-51da-975fcc88e3cb"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
await connector.getBalance(“0x5dB...36b”);
‘84.4242’
```
</div><br /></b>
- Transfer native chain balance:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-ec83abb1-7fff-4207-3f6b-bb6b778391da"><div dir="ltr" style="margin-left:0pt;" align="left">
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
</div><br /></b>
- Change balance transfer on native chain:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-ec83abb1-7fff-4207-3f6b-bb6b778391db"><div dir="ltr" style="margin-left:0pt;" align="left">
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
</div><br /></b>

- Sign typed data:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-ac4929f1-7fff-a59c-3644-252f07ce73da"><div dir="ltr" style="margin-left:0pt;" align="left">
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
</div><br /></b>

### Managers

A ContractManager is an abstraction which represents a connection to a specific contract on the Blockchain, so that applications can interact with the contract methods and events.

To instantiate a ContractManager class it must be imported from the base export or the managers module.

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-819e1477-7fff-d31e-3ad5-81612e5050ac"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
import { ContractManager } from ‘@ripio/sdk’;
// Or from managers module
import { ContractManager } from ‘@ripio/sdk/managers’;
const contract = new ContractManager();
```
</div><br /></b>

The Contract Manager class allows you to interact with an on-chain contract regardless of the functions it contains. In order to use it, it must be activated.

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-f4cdc684-7fff-2c60-be43-e13d0d1ce6b9"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
await contract.activate({
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI
});
```
</div><br /></b>

The CONTRACT_ADDRESS parameter is the string address of a contract available on the blockchain which you want to interact with.

In order to communicate with the on-chain contract, this class needs to know what methods are available and the parameters that the functions require, which is what the CONTRACT_ABI parameter (Application Binary Interface, ABI) provides.

ABI Example:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-3596c757-7fff-6013-b9b0-12051132eccd"><div dir="ltr" style="margin-left:0pt;" align="left">
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
</div><br /></b>

After activating the ContractManager instance you can make a call to a method of the instantiated contract by calling the ‘execute’ function provided by the manager class. The following example gets the result of calling a "name" method that returns a string value, in case that the method called does not exists on the contract’s ABI it will throw an error:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-c748497a-7fff-c63a-71ea-284e7113ef85"><div dir="ltr" style="margin-left:0pt;" align="left">
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
</div><br /></b>

In this case the function only returns a value. It does not sign any transaction (modify contract values). These cases will be shown in the following sections.

In case that an error occurs during the execution of the “execute” function, an error will be thrown, containing a generic error and the error that originated that exception. By catching the error with a try-catch statement, and inspecting the “cause” of the exception, you’ll be able to see what happened internally.

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-63da0021-7fff-f444-ca3b-8634f18cac22"><div dir="ltr" style="margin-left:0pt;" align="left">
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
</div><br /></b>

The following list are managers that follow the standards but can also be used with contracts that extend or implement them, whether standards or a particular design:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-77d25a28-7fff-5340-5b26-fe1f10536310"><div dir="ltr" style="margin-left:0pt;" align="left">
Token20Manager | It represents a standard ERC20 contract that implements a fungible token (a coin).
-- | --
NFT721Manager | It represents a standard ERC721 contract that implements non-fungible tokens (NFTs).
</div><br /></b>

#### Token20Manager

In most cases you will want to instantiate a contract designed under an ERC standard (eg ERC20 for a fungible token contract). In that case you can instantiate the contract with a specific class of the mentioned standard:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-80ac2ca2-7fff-0e83-a347-e042a4c15b8b"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
// commonJS
const { Token20Manager } = require('@rgc/sdk/managers');
// TS
import { Token20Manager } from '@rgc/sdk';
const contract = new Token20Manager();
```
</div><br /></b>

The advantage of using a specific class from a standard is that the concrete functions are coded to be called directly:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-aad3906e-7fff-9536-0381-53ea54c1106f"><div dir="ltr" style="margin-left:0pt;" align="left">
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
</div><br /></b>

#### NFT721Manager

When working with NFTs it is recommended to use the NFT721Manager that follows the ERC721 standard (for a non fungible token contract). If that’s the case you can instantiate the manager of the mentioned standard:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-aca8daa8-7fff-7b3d-af92-1adbe4a8cb46"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
// commonJS
const { NFT721Manager } = require('@rgc/sdk/managers');
// TS
import { NFT721Manager } from '@rgc/sdk';

const contract = new NFT721Manager();

````
</div><br /></b>

The advantage of using a specific class from a standard is that the concrete functions are coded to be called directly:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-ec25139d-7fff-c19b-1b87-1fd7a211f394"><div dir="ltr" style="margin-left:0pt;" align="left">
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
````

</div><br /></b>

#### Activation

ContractManager and any class that represents a standard must be activated in order to be used. The activation process includes providing the ABI and the contract’s address on the blockchain. In addition to that, activation is important because it allows you to set up the connection to the Blockchain and the way in which transactions will be signed (except in read-only functions).
When you activate a ContractManager a connector is generated internally depending on the parameters provided in the activate method.

Activating a manager without parameters in addition to contractAddress and ABI generates a BrowserWeb3Connector, which will connect and sign transactions with the injected web3 browser extension:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-0629c62c-7fff-d9ee-cd3a-81fc479d5f82"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
await contract.activate({
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI
});
```
</div><br /></b>

On the other hand, if the Blockchain node URL is added, it will generate a JsonRPCWeb3Connector, which will connect without depending on any browser extension. In this case, the manager will be in read only mode(transactions cannot be signed):

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d082ff2c-7fff-aba5-5a27-ab888c452cd7"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
await contract.activate({
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI,
    providerWss: WSS
});
```
</div><br /></b>

If a private key is added to this last call, it will generate a JsonRPCWeb3Connector, same as the previous one, but it will be possible to sign transactions using the private key provided.

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-6a4959d3-7fff-b9ae-3ff8-941bd2055623"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
await contract.activate({
contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI,
    providerWss: WSS,
    privateKey: PRIVATE_KEY
});
```
</div><br /></b>

Sometimes it is necessary to have a connector instance to perform certain tasks. It is possible to instantiate a BrowserWeb3Connector and JsonRPCWeb3Connector and they must be activated as well. Also, those instances can be used in activation of a ContractManager.

With BrowserWeb3Connector:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-26b848ef-7fff-6013-5b38-220d4b4f413a"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
let browserConn = new BrowserWeb3Connector();
let chain = await browserConn.activate();
await contract.activate({
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI,
    connector: browserConn
});
```
</div><br /></b>

With JsonRPCWeb3Connector:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-046a114d-7fff-d07f-968d-f5f379480fb8"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
let jsonRPCConn = new JsonRPCWeb3Connector(WSS, PRIVATE_KEY);
chain = await jsonRPCConn.activate();
await contract.activate({
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI,
    connector: jsonRPCConn
});
```
</div><br /></b>

### Injected web3 interaction

When activating a BrowserWeb3Connector the web3 browser extension will receive a request that the user must approve so that the connector can operate on behalf of the connected account. If this request is rejected then the activation process will fail.

Once the BrowserWeb3Connector is active the following methods are available to be used:

- Add a new chain:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-3902bd21-7fff-16e0-33dc-22c756a903ff"><div dir="ltr" style="margin-left:0pt;" align="left">
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
</div><br /></b>

- Request a chain switch:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-ee11e93e-7fff-5218-33fd-d89c743d0cb4"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const chainId = 100;
await connector.switchChain(chainId);
```
</div><br /></b>

An injected web3 provider will emit events so that the user can listen to them and act accordingly. To do that, the manager instances contain a [NodeJS EventEmitter](https://nodejs.org/api/events.html) that will be listening to these events, handling the changes and re-emitting them. The manager instances have methods for the user to create or delete listeners as follows:

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-7fa199c8-7fff-edf4-3adc-dfb007d85c3a"><div dir="ltr" style="margin-left:0pt;" align="left">
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
</div><br /></b>

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

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-07b4807a-7fff-4c37-69aa-22473181f600"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const tx = await manager.execute(...);
const confirmations = getMinConfirmations(manager.connector.chainId);
await tx.transactionResponse.wait(confirmations); // amount of confirmations for the specific chain or a default value
const confirmations = 10;
await tx.transactionResponse.wait(confirmations); // 10 confirmations
```
</div><br /></b>

- cancel(gasSpeed?):

An asynchronous function that cancels a transaction by sending a transaction with value 0, the same nonce and a higher fee. If no parameter was passed to the cancel function then it will use the speedUpPercentage value available on the connector class with a 10% default value.It can be canceled if the transaction is still in the mem pool, in case that the transaction was already mined then it will fail.

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d57db8c3-7fff-98b6-b7bc-b3a69078522b"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const tx = await manager.execute(...);
const response = await tx.transactionResponse.cancel(); // default gas price 10% up
const gasSpeed = BigNumber.from(40);
const response = await tx.transactionResponse.cancel(gasSpeed);
```
</div><br /></b>

- speedUp(gasSpeed?):

An asynchronous function that speeds up a transaction by re-sending it with a higher fee. If no parameter was passed to the speedUp function then it will use the speedUpPercentage value available on the connector class with a 10% default value. It can be speeded up if the transaction is still in the mem pool, in case that the transaction was already mined then it will fail.

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-31bf87a8-7fff-fd76-4973-e9c45716f597"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const tx = await manager.execute(...);
const response = await tx.transactionResponse.speedUp(); // default gas price 10% up
const gasSpeed = BigNumber.from(40);
const response = await tx.transactionResponse.speedUp(gasSpeed);
```
</div><br /></b>

- change(newParams, gasSpeed?):

An asynchronous function that changes the transaction by repeating the execution of the same method but updating the parameters passed to the function with new ones. If no gasSpeed parameter was passed to the change function then it will use the speedUpPercentage value available on the connector class with a 10% default value. It can be changed if the transaction is still in the mem pool, in case that the transaction was already mined then it will fail.

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-c807b6f1-7fff-40b4-7776-cf60a79db1be"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
const tx = await manager.execute(...);
const response = await tx.transactionResponse.change({to: ‘0x...123’}); // default gas price 10% up
const gasSpeed = BigNumber.from(100);
const response = await tx.transactionResponse.change({to: ‘0x...123’}, gasSpeed);
```
</div><br /></b>

### Utils and others

The utils submodule exports certain functionalities related to:

#### Connectors

- verifyMessage(nonce, signature, expectedAddress): It takes a nonce, a signature, and an expected address, and returns true if the signature is valid for the nonce and the expected address.

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-18a9fa74-7fff-d786-6455-06af4a99f8ff"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
// commonJS
const { connectorsUtils } = require('@rgc/sdk/utils');
// TS
import { connectorsUtils } from '@rgc/sdk';

const message = ‘Log in with nonce: 999’;
const expected = ‘0x12...789’
const signature = ‘abc...123’;
connectorsUtils.verifyMessage(message, signature, expected);
true

````
</div><br /></b>

- getMinConfirmations(chainId): It returns the minimum number of confirmations required for a transaction to be considered valid for a specific chain.

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-351eb4f1-7fff-1cd5-7e3c-5a0f104cfe41"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
// commonJS
const { connectorsUtils } = require('@rgc/sdk/utils');
// TS
import { connectorsUtils } from '@rgc/sdk';

connectorsUtils.getMinConfirmations(100);
1
````

</div><br /></b>

#### Conversions

- fromWei(value, unit): It takes a BigNumberish value and a unit and returns a string.

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-c4c7df42-7fff-5fc5-ab04-caf45b11aadf"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
// commonJS
const { conversions } = require('@rgc/sdk/utils');
const { enums } = require('@rgc/sdk/types');
// TS
import { conversions } from '@rgc/sdk';
import { enums } from '@rgc/sdk';

conversions.fromWei('1', enums.UnitTypes.ETHER);
'0.000000000000000001'
conversions.fromWei('1', enums.UnitTypes.WEI);
'1'

````
</div><br /></b>

- toWei(value, unit): It converts a string value representing a unit type into WEI (BigNumber).

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-a982ae83-7fff-af34-5711-dfc5e62bef0f"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
// commonJS
const { conversions } = require('@rgc/sdk/utils');
const { enums } = require('@rgc/sdk/types');
// TS
import { conversions } from '@rgc/sdk';
import { enums } from '@rgc/sdk';

conversions.toWei('1', enums.UnitTypes.ETHER)BigNumber { _hex: '0x0de0b6b3a7640000', _isBigNumber: true }
conversions.toWei('1', enums.UnitTypes.WEI)BigNumber { _hex: '0x01', _isBigNumber: true }
conversions.toWei('1', enums.UnitTypes.ETHER).toString();
'1000000000000000000'
conversions.toWei('1', enums.UnitTypes.WEI).toString();
'1'
````

</div><br /></b>

- numberToHex(num): It converts a number to a hex string (only integers).

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-de8110e0-7fff-6d87-a69b-c42f43047379"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
// commonJS
const { conversions } = require('@rgc/sdk/utils');
// TS
import { conversions } from '@rgc/sdk';

conversions.numberToHex(123);
‘0x7b’

````
</div><br /></b>

- hexToNumber(hex): It takes a hexadecimal string and returns a number.

<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-7d53603c-7fff-7209-a86e-8b1d8f9e67bd"><div dir="ltr" style="margin-left:0pt;" align="left">
```javascript
// commonJS
const { conversions } = require('@rgc/sdk/utils');
// TS
import { conversions } from '@rgc/sdk';

conversions.hexToNumber(‘0x7b’);
123
````

</div><br /></b>
