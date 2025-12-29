import type { ContractRegistry } from '../index'

// VeryChain Mainnet contracts (native currency - VERY)
const contracts: ContractRegistry = {
  SellerRegistry: {
    address: '0xa7e5175e571D6B7391658F1E35120290C38E26a4',
    name: 'SellerRegistry',
    description: 'On-chain registry for verified sellers',
  },
  ProductRegistry: {
    address: '0xb7f3d139128D54E6F994Bcf0DE88d5Da8D1c71d2',
    name: 'ProductRegistry',
    description: 'On-chain registry for products',
  },
  TipJar: {
    address: '0x2927b1f7C76AA9302621fC3dee30B024ab11d677',
    name: 'TipJar',
    description: 'Allows viewers to tip streamers using native currency',
  },
  GiftShop: {
    address: '0xA846E4D57cDB3077ED67E5d792949F7A6ef2a75d',
    name: 'GiftShop',
    description: 'Virtual gifts for live streams using native currency',
  },
  OrderEscrow: {
    address: '0xE54FB90AFad32c87B45b5E8e20Cc0E02080bf7F5',
    name: 'OrderEscrow',
    description: 'Holds buyer payments until delivery is confirmed',
  },
  ReviewRegistry: {
    address: '0x57887E6362c69635de9FEb88627A91c0207061C5',
    name: 'ReviewRegistry',
    description: 'On-chain verified reviews for purchased products',
  },
}

export default contracts
