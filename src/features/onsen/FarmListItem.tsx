import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { CurrencyLogo, CurrencyLogoArray } from 'app/components/CurrencyLogo'
import QuestionHelper from 'app/components/QuestionHelper'
import Typography from 'app/components/Typography'
import { TABLE_TBODY_TD_CLASSNAME, TABLE_TBODY_TR_CLASSNAME } from 'app/features/trident/constants'
import { classNames, formatNumber, formatPercent } from 'app/functions'
import { useCurrency } from 'app/hooks/Tokens'
import React, { FC, ReactNode } from 'react'

import { PairType } from './enum'

interface FarmListItem {
  farm: any
  onClick(x: ReactNode): void
}

// @ts-ignore TYPE NEEDS FIXING
const FarmListItem: FC<FarmListItem> = ({ farm, onClick }) => {
  const { i18n } = useLingui()
  const token0 = useCurrency(farm.pair.token0?.id) ?? undefined
  const token1 = useCurrency(farm.pair.token1?.id) ?? undefined

  return (
    <div className={classNames(TABLE_TBODY_TR_CLASSNAME, 'grid grid-cols-4')} onClick={onClick}>
      <div className={classNames('flex gap-2', TABLE_TBODY_TD_CLASSNAME(0, 4))}>
        {token0 && token1 && <CurrencyLogoArray currencies={[token0, token1]} dense size={32} />}

        {token0 && !token1 && <CurrencyLogo currency={token0} size={32} />}

        <div className="flex flex-col items-start">
          <Typography weight={700} className="flex gap-1 text-high-emphesis">
            {farm?.pair?.token0?.symbol === 'OS' ? 'OWL' : (farm?.pair?.token0?.symbol === 'xOS' ? 'xOWL' : farm?.pair?.token0?.symbol)}
            {farm?.pair?.token1 && <span className="text-low-emphesis">/</span>}
            {farm?.pair?.token1?.symbol === 'OS' ? 'OWL' : (farm?.pair?.token1?.symbol === 'xOS' ? 'xOWL' : farm?.pair?.token1?.symbol)}
          </Typography>
          {farm?.pair?.id && (
            <Typography variant="xs" className="text-blue hover:text-blue/80">
              <a 
                href={`https://www.geckoterminal.com/songbird/pools/${farm?.pair?.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                View on Gecko Terminal
              </a>
            </Typography>
          )}
          {farm?.pair?.type === PairType.SWAP && (
            <Typography variant="xs" className="text-low-emphesis">
              {/* {i18n._(t`OwlSwap Farm`)} */}
            </Typography>
          )}
          {farm?.pair?.type === PairType.KASHI && (
            <Typography variant="xs" className="text-low-emphesis">
              {i18n._(t`Kashi Farm`)}
            </Typography>
          )}
        </div>
      </div>
      <div className={TABLE_TBODY_TD_CLASSNAME(1, 4)}>
        <Typography weight={700} className="text-high-emphesis">
          {formatNumber(farm.tvl, false)}
        </Typography>
      </div>
      <div className={classNames('flex flex-col !items-end !justify-center', TABLE_TBODY_TD_CLASSNAME(2, 4))}>
        {/* @ts-ignore TYPE NEEDS FIXING */}
        {farm?.rewards?.map((reward, i) => (
          <Typography
            variant="sm"
            weight={700}
            key={i}
            className="flex gap-1.5 text-high-emphesis justify-center items-center"
            component="span"
          >
            {formatNumber(reward.rewardPerDay)}
            <CurrencyLogo currency={reward.currency} size={32} />
          </Typography>
        ))}
      </div>
      <div className={classNames('flex flex-col !items-end', TABLE_TBODY_TD_CLASSNAME(3, 4))}>
        <Typography weight={700} className="flex gap-0.5 items-center text-high-emphesis">
          {farm?.tvl !== 0
            ? farm?.roiPerYear > 10000
              ? '>10,000%'
              : formatPercent(farm?.roiPerYear * 100)
            : 'Infinite'}
          {!!farm?.feeApyPerYear && (
            <QuestionHelper
              text={
                <div className="flex flex-col">
                  <div>
                    Reward APR:{' '}
                    {farm?.tvl !== 0
                      ? farm?.rewardAprPerYear > 10000
                        ? '>10,000%'
                        : formatPercent(farm?.rewardAprPerYear * 100)
                      : 'Infinite'}
                  </div>
                  <div>
                    Fee APR: {farm?.feeApyPerYear < 10000 ? formatPercent(farm?.feeApyPerYear * 100) : '>10,000%'}
                  </div>
                </div>
              }
            />
          )}
        </Typography>
        <Typography variant="xs" className="text-low-emphesis">
          {i18n._(t`annualized`)}
        </Typography>
      </div>
    </div>
  )
}

export default FarmListItem
