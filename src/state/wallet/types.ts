import { CurrencyAmount, Token } from '@oracleswap/core-sdk'

type TokenAddress = string

export type TokenBalancesMap = Record<TokenAddress, CurrencyAmount<Token>>
