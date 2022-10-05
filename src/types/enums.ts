export enum UnitTypes {
  WEI = 0,
  KWEI = 3,
  MWEI = 6,
  GWEI = 9,
  SZABO = 12,
  FINNEY = 15,
  ETHER = 18
}

export enum ChainIds {
  // RIPIOCHAIN = , // TODO
  RIPIOCHAIN_TESTNET = 100,
  ETH = 1,
  RINKEBY = 4,
  ROPSTEN = 3,
  GOERLI = 5,
  KOVAN = 42,
  POLYGON = 137,
  MUMBAI = 80001,
  BINANCE = 56,
  BINANCE_TESTNET = 97
}

export enum TokenDataTypes {
  JSON = 'json',
  BASE64 = 'base64'
}

export enum AbiItemTypes {
  FUNCTION = 'function',
  EVENT = 'event'
}
