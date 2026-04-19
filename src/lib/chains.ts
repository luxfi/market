import type { Chain } from 'viem'

export const luxMainnet: Chain = {
  id: 96369,
  name: 'Lux',
  nativeCurrency: { name: 'Lux', symbol: 'LUX', decimals: 18 },
  rpcUrls: { default: { http: ['https://api.lux.network/mainnet/ext/bc/C/rpc'] } },
  blockExplorers: { default: { name: 'Explore', url: 'https://explore.lux.network' } },
}

export const zooMainnet: Chain = {
  id: 200200,
  name: 'Zoo',
  nativeCurrency: { name: 'Zoo', symbol: 'ZOO', decimals: 18 },
  rpcUrls: { default: { http: ['https://api.zoo.network/mainnet/ext/bc/C/rpc'] } },
  blockExplorers: { default: { name: 'Explore Zoo', url: 'https://explore.zoo.network' } },
}

export const hanzoMainnet: Chain = {
  id: 36963,
  name: 'Hanzo',
  nativeCurrency: { name: 'Hanzo', symbol: 'HANZO', decimals: 18 },
  rpcUrls: { default: { http: ['https://api.lux.network/mainnet/ext/bc/2GiQb73CeJESjc4omFv2YtQHZrRgJf25NXPzAr5J6UNHRcDV2F/rpc'] } },
  blockExplorers: { default: { name: 'Explore Hanzo', url: 'https://explore-hanzo.lux.network' } },
}

export const spcMainnet: Chain = {
  id: 36911,
  name: 'SPC',
  nativeCurrency: { name: 'SPC', symbol: 'SPC', decimals: 18 },
  rpcUrls: { default: { http: ['https://api.lux.network/mainnet/ext/bc/rtjwvtE1tEvrokmpeYdTq7b2zqZgmybKwR5MLjKMGAR1W78dQ/rpc'] } },
  blockExplorers: { default: { name: 'Explore SPC', url: 'https://explore-spc.lux.network' } },
}

export const parsMainnet: Chain = {
  id: 17471,
  name: 'Pars',
  nativeCurrency: { name: 'Pars', symbol: 'PARS', decimals: 18 },
  rpcUrls: { default: { http: ['https://api.pars.network/mainnet/ext/bc/C/rpc'] } },
  blockExplorers: { default: { name: 'Explore Pars', url: 'https://explore.pars.network' } },
}

export const supportedChains: readonly Chain[] = [luxMainnet, zooMainnet, hanzoMainnet, spcMainnet, parsMainnet]

export const EXPLORER_API: Record<number, string> = {
  [luxMainnet.id]: 'https://explore.lux.network/api/v2',
  [zooMainnet.id]: 'https://explore.zoo.network/api/v2',
  [hanzoMainnet.id]: 'https://explore-hanzo.lux.network/api/v2',
  [spcMainnet.id]: 'https://explore-spc.lux.network/api/v2',
  [parsMainnet.id]: 'https://explore.pars.network/api/v2',
}

export const CHAIN_INFO: Record<number, { name: string; symbol: string }> = {
  [luxMainnet.id]: { name: 'Lux', symbol: 'LUX' },
  [zooMainnet.id]: { name: 'Zoo', symbol: 'ZOO' },
  [hanzoMainnet.id]: { name: 'Hanzo', symbol: 'HANZO' },
  [spcMainnet.id]: { name: 'SPC', symbol: 'SPC' },
  [parsMainnet.id]: { name: 'Pars', symbol: 'PARS' },
}
