import { ChainId as SushiChainId } from '@sushiswap/core-sdk'

export const ChainId = {
  ...SushiChainId,
  SONGBIRD: 19 // Songbird's chain ID is 19
} as const 