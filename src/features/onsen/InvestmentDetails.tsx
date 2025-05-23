import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ChainId, CurrencyAmount, JSBI, Token, USD, ZERO } from '@sushiswap/core-sdk'
import Button from 'app/components/Button'

import { CurrencyLogo } from 'app/components/CurrencyLogo'
import { HeadlessUiModal } from 'app/components/Modal'
import Typography from 'app/components/Typography'

import { easyAmount, formatNumber } from 'app/functions'
import { useCurrency } from 'app/hooks/Tokens'
import { useActiveWeb3React } from 'app/services/web3'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { PairType } from './enum'
import { usePendingSushi, useUserInfo } from './hooks'
import useMasterChef from './useMasterChef'
import usePendingReward from './usePendingReward'
import { useTotalSupply } from 'app/hooks/useTotalSupply'
import { useV2Pair } from 'app/hooks/useV2Pairs'

// @ts-ignore TYPE NEEDS FIXING
const RewardRow = ({ value, symbol }) => {
  return (
    <Typography weight={700} className="text-high-emphesis">
      {value}{' '}
      <Typography component="span" className="text-secondary">
        {symbol}
      </Typography>
    </Typography>
  )
}

// @ts-ignore TYPE NEEDS FIXING
const InvestmentDetails = ({ farm }) => {
  const { i18n } = useLingui()
  const { chainId } = useActiveWeb3React()
  const { harvest } = useMasterChef(farm.chef)
  const router = useRouter()
  const addTransaction = useTransactionAdder()
  const [pendingTx, setPendingTx] = useState(false)
  const token0 = useCurrency(farm.pair.token0?.id)
  const token1 = useCurrency(farm.pair.token1?.id)

  const liquidityToken = new Token(
    // @ts-ignore TYPE NEEDS FIXING
    chainId,
    getAddress(farm.pair.id),
    farm.pair.type === PairType.KASHI ? Number(farm.pair.asset.decimals) : 18,
    farm.pair.type === PairType.SINGLE ? farm.pair.symbol : farm.pair.type === PairType.KASHI ? 'KMP' : 'OLP',
    farm.pair.name
  )

  const stakedAmount = useUserInfo(farm, liquidityToken)



  const pendingSushi = usePendingSushi(farm)
  const pendingReward = usePendingReward(farm)

  const positionFiatValue = CurrencyAmount.fromRawAmount(
    // @ts-ignore TYPE NEEDS FIXING
    USD[chainId],
    farm.pair.type === PairType.KASHI
      ?  ZERO
      : JSBI.BigInt(
          ((Number(stakedAmount?.toExact() ?? '0') * farm.pair.reserveUSD) / farm.pair.totalSupply)
            // @ts-ignore TYPE NEEDS FIXING
            .toFixed(USD[chainId].decimals)
            // @ts-ignore TYPE NEEDS FIXING
            .toBigNumber(USD[chainId].decimals)
        )
  )

  // @ts-ignore TYPE NEEDS FIXING
  const secondaryRewardOnly = [ChainId.FUSE].includes(chainId)

  const rewardValue = !secondaryRewardOnly
    ? (farm?.rewards?.[0]?.rewardPrice ?? 0) * Number(pendingSushi?.toExact() ?? 0) +
      (farm?.rewards?.[1]?.rewardPrice ?? 0) * Number(pendingReward ?? 0)
    : (farm?.rewards?.[0]?.rewardPrice ?? 0) * Number(pendingReward ?? 0)

  async function onHarvest() {
    setPendingTx(true)
    try {
      const tx = await harvest(farm.id)
      addTransaction(tx, {
        summary: i18n._(t`Harvest ${farm.pair.token0.name}/${farm.pair.token1?.name}`),
      })
    } catch (error) {
      console.error(error)
    }
    setPendingTx(false)
  }

  const [, pair] = useV2Pair(token0 ?? undefined, token1 ?? undefined)

  // liquidity values
  const totalSupply = useTotalSupply(liquidityToken)

  const reserve0 = pair?.token0?.address === token0?.wrapped?.address ? pair?.reserve0 : pair?.reserve1

  const reserve1 = pair?.token1?.address === token1?.wrapped?.address ? pair?.reserve1 : pair?.reserve0

  return (
    <>
      <HeadlessUiModal.BorderedContent className="flex flex-col gap-2 bg-dark-1000/40">
        <div className="flex justify-between">
          <Typography variant="xs" weight={700} className="text-secondary">
            {i18n._(t`Your Deposits`)}
          </Typography>
          <Typography variant="xs" className="flex gap-1 text-secondary">
            {formatNumber(stakedAmount?.toSignificant(6) ?? 0)} {farm.pair.token0.symbol}
            {farm.pair.token1 && '-'}
            {farm.pair.token1?.symbol}
            <Typography variant="xs" weight={700} className="text-high-emphesis" component="span">
              {/* {formatNumber(positionFiatValue?.toSignificant(6) ?? 0, true)} */}
            </Typography>
          </Typography>
        </div>
        {[PairType.KASHI, PairType.SWAP].includes(farm.pair.type) && (
          <div className="flex items-center gap-2">
            {/*@ts-ignore TYPE NEEDS FIXING*/}
            {token0 && <CurrencyLogo currency={token0} size={18} />}

            {farm.pair.type === PairType.SWAP && reserve0 && stakedAmount && totalSupply && (
              // <RewardRow
              //   value={formatNumber(
              //     (farm.pair.reserve0 * Number(stakedAmount?.toExact() ?? 0)) / farm.pair.totalSupply
              //   )}
              //   symbol={token0?.symbol}
              // />

              <RewardRow
                value={formatNumber(reserve0?.multiply(stakedAmount).divide(totalSupply).toSignificant(6))}
                symbol={token0?.symbol}
              />
            )}
          </div>
        )}
        {farm.pair.type === PairType.SWAP && reserve0 && stakedAmount && totalSupply && (
          <div className="flex items-center gap-2">
            {token1 && <CurrencyLogo currency={token1} size={18} />}
            {/* <RewardRow
              value={formatNumber((farm.pair.reserve1 * Number(stakedAmount?.toExact() ?? 0)) / farm.pair.totalSupply)}
              symbol={token1?.symbol}
            /> */}

            <RewardRow
              value={formatNumber(reserve1?.multiply(stakedAmount).divide(totalSupply).toSignificant(6))}
              symbol={token1?.symbol}
            />
          </div>
        )}
      </HeadlessUiModal.BorderedContent>
      <HeadlessUiModal.BorderedContent className="flex flex-col gap-2 bg-dark-1000/40">
        <div className="flex justify-between">
          <Typography variant="xs" weight={700} className="text-secondary">
            {i18n._(t`Your Rewards`)}
          </Typography>
          <Typography variant="xs" weight={700} className="text-high-emphesis" component="span">
            {/* {formatNumber(rewardValue, true)} */}
          </Typography>
        </div>

        {/* @ts-ignore TYPE NEEDS FIXING */}
        {farm?.rewards?.map((reward, i) => {
          return (
            <div className="flex items-center gap-2" key={i}>
              <CurrencyLogo currency={reward.currency} size={30} />
              {!secondaryRewardOnly ? (
                <>
                  {i === 0 && (
                    <RewardRow
                      value={formatNumber(pendingSushi?.toSignificant(6) ?? 0)}
                      symbol={reward.currency.symbol}
                    />
                  )}
                  {i === 1 && <RewardRow value={formatNumber(pendingReward)} symbol={reward.currency.symbol} />}
                </>
              ) : (
                <RewardRow value={formatNumber(pendingReward)} symbol={reward.currency.symbol} />
              )}
            </div>
          )
        })}
      </HeadlessUiModal.BorderedContent>

      <Button
        loading={pendingTx}
        fullWidth
        color="blue"
        disabled={
          pendingTx ||
          !((pendingSushi && pendingSushi.greaterThan(ZERO)) || (pendingReward && Number(pendingReward) > 0))
        }
        onClick={onHarvest}
      >
        {i18n._(t`Harvest Rewards`)}
      </Button>
    </>
  )
}

export default InvestmentDetails
