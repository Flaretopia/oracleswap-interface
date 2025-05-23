import { BigNumber } from '@ethersproject/bignumber'
import { MinusIcon, PlusIcon } from '@heroicons/react/solid'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Slider from '@mui/material/Slider'
import { Currency, CurrencyAmount, ZERO } from '@sushiswap/core-sdk'
import { PROPHET } from 'app/config/tokens'
import { PROSTAKING_ADDRESS } from 'app/constants'
import { tryParseAmount } from 'app/functions'
import { ApprovalState, useApproveCallback } from 'app/hooks'
import {
  useMinProAmount,
  useMinXOracleAmount,
  useProPendingReward,
  useProStakingActions,
  useProStakingUserInfo,
  useProStakingUserNFTCount,
  useProUserTotalReward,
} from 'app/hooks/useProstaking'
import { useActiveWeb3React } from 'app/services/web3'
import { useTokenBalance } from 'app/state/wallet/hooks'
import { isArray } from 'lodash'
import Image from 'next/image'
import CountDown from 'pages/prostaking/CountDown'
import React, { FC, useEffect, useMemo, useState } from 'react'

import AssetInput from '../AssetInput'
import Button from '../Button'
import { HeadlessUiModal } from '../Modal'
import Switch from '../Switch'
import Typography from '../Typography'
import QuestionHelper from 'app/components/QuestionHelper'
import Web3Connect from '../Web3Connect'

import PROLOGO from '../../../public/PRO_Logo3Gold.png'
import ProfileIcon from '../../../public/profile_icon.webp'
import OracleSilverLogo from '../../../public/ORACLE_SilverLogo.png'

const moment = require('moment')
const sendTx = async (txFunc: () => Promise<any>): Promise<boolean> => {
  let success = true
  try {
    const ret = await txFunc()
    if (ret?.error) {
      success = false
    }
  } catch (e) {
    console.error(e)
    success = false
  }
  return success
}

interface ProphetStakingProps {
  totalPoolSize: CurrencyAmount<Currency> | undefined
}

export const ProphetStaking: FC<ProphetStakingProps> = ({ totalPoolSize }) => {
  const [toggle, setToggle] = useState(true)
  const [depositValue, setDepositValue] = useState<string>()
  const [withdrawValue, setWithdrawValue] = useState<string>()

  const marks = [
    {
      value: 0,
      label: '0',
    },
    {
      value: 1,
      label: '1M',
    },
    {
      value: 2,
      label: '3M',
    },
    {
      value: 3,
      label: '6M',
    },
    {
      value: 4,
      label: '1Y',
    },
  ]
  function valuetext(value: any) {
    return `${value}`
  }
  const { account, chainId } = useActiveWeb3React()

  const liquidityToken = PROPHET

  const balance = useTokenBalance(account ?? undefined, liquidityToken)

  const [lockMode, setLockMode] = useState(0)

  const {
    lockMode: userLockMode,
    unlockTime,
    lockedProAmount: stakedAmount,
    userNFTWeight,
    userTotalWeight,
    lockXOracle,
  } = useProStakingUserInfo()

  const minProAmount = useMinProAmount()

  const lowProAmount = useMemo(() => {
    if (minProAmount && stakedAmount) {
      return minProAmount.subtract(stakedAmount).greaterThan(ZERO)
    }
    return true
  }, [minProAmount, stakedAmount])

  const minXOracleAmount = useMinXOracleAmount()

  const nftCount = useProStakingUserNFTCount()

  const parsedDepositValue = tryParseAmount(depositValue, liquidityToken)
  const parsedWithdrawValue = tryParseAmount(withdrawValue, liquidityToken)
  // @ts-ignore TYPE NEEDS FIXING
  const [approvalState, approve] = useApproveCallback(parsedDepositValue, PROSTAKING_ADDRESS)

  const depositLowProAmount = useMemo(() => {
    if (minProAmount && parsedDepositValue && stakedAmount) {
      return minProAmount
        .add(parsedDepositValue?.divide(100))
        .subtract(parsedDepositValue)
        .subtract(stakedAmount)
        .greaterThan(ZERO)
    }
    return true
  }, [minProAmount, parsedDepositValue, stakedAmount])

  const depositError = !parsedDepositValue
    ? 'Enter an amount'
    : balance?.lessThan(parsedDepositValue)
    ? 'Insufficient balance'
    : nftCount > 0 && lockMode > 0 && depositLowProAmount
    ? 'More PRO Required for NFT Staking'
    : undefined

  const isDepositValid = !depositError
  const withdrawError = !parsedWithdrawValue
    ? 'Enter an amount'
    : // @ts-ignore TYPE NEEDS FIXING
    stakedAmount?.lessThan(parsedWithdrawValue)
    ? 'Insufficient balance'
    : undefined
  const isWithdrawValid = !withdrawError

  // const { setContent } = useFarmListItemDetailsModal()

  const { deposit, withdraw, harvest, increaseLockAmount, extendLockMode, shortenLockMode } = useProStakingActions()

  const [pendingTx, setPendingTx] = useState(false)

  const proHarvest = async () => {
    if (!account) {
      return
    } else {
      setPendingTx(true)

      const success = await sendTx(() => harvest())
      if (!success) {
        setPendingTx(false)
        return
      }

      setPendingTx(false)
    }
  }

  const isLockAmount = useMemo(() => {
    if (stakedAmount && stakedAmount.greaterThan(ZERO)) {
      return true
    }
    return false
  }, [stakedAmount])

  var current = Date.now()

  const freeLockTime = useMemo(() => {
    if (userLockMode > 0) {
      if (unlockTime) {
        if (unlockTime * 1000 > current) {
          return false
        } else {
          return true
        }
      }
    }
    return true
  }, [current, unlockTime, userLockMode])

  const isForceShortenLockTime = useMemo(() => {
    if (isLockAmount) {
      if (userLockMode > 0) {
        if (unlockTime) {
          if (unlockTime * 1000 <= current) {
            return true
          }
        }
      }
    }
    return false
  }, [isLockAmount, userLockMode, unlockTime, current])

  const depositButtonString = isForceShortenLockTime
    ? i18n._(t`RESET LOCK`)
    : isLockAmount
    ? i18n._(t`Increase Deposit`)
    : i18n._(t`Confirm Deposit`)

  const proDeposit = async () => {
    if (isForceShortenLockTime) {
      if (account) {
        setPendingTx(true)

        const success = await sendTx(() => shortenLockMode(0))
        if (!success) {
          setPendingTx(false)
          return
        }
        setPendingTx(false)
      }
    } else {
      if (!account || !isDepositValid) {
        return
      } else {
        setPendingTx(true)

        const amount = BigNumber.from(parsedDepositValue?.quotient.toString())

        if (stakedAmount && stakedAmount.greaterThan(ZERO)) {
          const success = await sendTx(() => increaseLockAmount(amount))
          if (!success) {
            setPendingTx(false)
            return
          }
        } else {
          const success = await sendTx(() => deposit(amount, lockMode))
          if (!success) {
            setPendingTx(false)
            return
          }
        }
        setPendingTx(false)
      }
    }
  }

  const proWithdraw = async () => {
    if (!account || !isWithdrawValid) {
      return
    } else {
      if (freeLockTime) {
        setPendingTx(true)

        const amount = BigNumber.from(parsedWithdrawValue?.quotient.toString())

        const success = await sendTx(() => withdraw(amount))
        if (!success) {
          setPendingTx(false)
          return
        }

        setPendingTx(false)
      } else {
        setShowConfirmation(true)
      }
    }
  }

  const proWithdrawAction = async () => {
    if (!account || !isWithdrawValid) {
      return
    } else {
      setPendingTx(true)

      const amount = BigNumber.from(parsedWithdrawValue?.quotient.toString())

      const success = await sendTx(() => withdraw(amount))

      if (!success) {
        setPendingTx(false)
        return
      }

      setPendingTx(false)
      setShowConfirmation(false)
    }
  }

  useEffect(() => {
    setLockMode(userLockMode)
  }, [userLockMode])

  const updateLockTime = async () => {
    if (!account || lockMode === userLockMode) {
      return
    } else {
      if (lockMode > userLockMode) {
        setPendingTx(true)
        const success = await sendTx(() => extendLockMode(lockMode))
        if (!success) {
          setPendingTx(false)
          return
        }
      } else {
        if (!freeLockTime) {
          return
        }
        setPendingTx(true)
        const success = await sendTx(() => shortenLockMode(lockMode))
        if (!success) {
          setPendingTx(false)
          return
        }
      }

      setPendingTx(false)
    }
  }
  const resetLockTime = async () => {
    setLockMode(0)
    if (!account) {
      return
    } else {
      setPendingTx(true)
      const success = await sendTx(() => shortenLockMode(0))
      if (!success) {
        setPendingTx(false)
        return
      }

      setPendingTx(false)
    }
  }

  const userReward = useProPendingReward()

  const userTotalReward = useProUserTotalReward()

  // const stakedAmount = lockedProAmount

  const rate = useMemo(() => {
    if (totalPoolSize && userTotalWeight && totalPoolSize.greaterThan(ZERO)) {
      return parseFloat(userTotalWeight.multiply(100).toSignificant(8)) / parseFloat(totalPoolSize?.toSignificant(8))
    }
    return 0
  }, [totalPoolSize, userTotalWeight])

  // const timeLock = useMemo(() => {
  //   if (!unlockTime) {
  //     return null
  //   }

  //   var date = new Date(unlockTime * 1000)
  //   var started = moment(date)

  //   var current = moment()

  //   var diff = started.diff(current)

  //   var duration = moment.duration(diff)

  //   var formated = duration.humanize(true)

  //   return formated
  // }, [unlockTime])

  // @ts-ignore TYPE NEEDS FIXING
  const [xOracleApprovalState, xOralceApprove] = useApproveCallback(
    minXOracleAmount?.multiply(nftCount),
    PROSTAKING_ADDRESS
  )

  const extendError = stakedAmount?.equalTo(ZERO)
    ? 'No Lock to extend'
    : userLockMode === 0 && lowProAmount
    ? 'More PRO Required to Extend NFT Staking'
    : xOracleApprovalState !== ApprovalState.APPROVED
    ? 'xOS Not Approved'
    : undefined

  const [showConfirmation, setShowConfirmation] = useState(false)

  return (
    <>
      <div className="flex flex-wrap mt-4 prophet-staking-wrapper">
        <div className="w-full md:w-[calc(100%-316px)] md:mr-4 md:pr-4 bg-dark-900 rounded-3xl p-5">
          <HeadlessUiModal.BorderedContent className="flex flex-col gap-4 bg-dark-00/40">
            <div className="flex justify-between">
              <Typography variant="h3" weight={700} className="text-high-emphesis">
                {toggle ? i18n._(t`Prophet Staking`) : i18n._(t`Prophet Unstake`)}
              </Typography>
              <Switch
                size="md"
                checked={toggle}
                onChange={() => setToggle(!toggle)}
                checkedIcon={<PlusIcon className="text-dark-1000" />}
                uncheckedIcon={<MinusIcon className="text-dark-1000" />}
              />
            </div>

            <AssetInput
              currencyLogo={false}
              currency={liquidityToken}
              value={toggle ? depositValue : withdrawValue}
              onChange={toggle ? setDepositValue : setWithdrawValue}
              balance={toggle ? balance : stakedAmount}
              showMax={false}
            />
          </HeadlessUiModal.BorderedContent>

          {!toggle ? (
            <div className="flex flex-col w-full gap-1 p-4 stake-wrap">
              {/* <div className="flex justify-between p-2 mt-2 mb-1 rounded-md box-wrapper">
                <p className="text-lg font-semibold">ORACLES SELECTED</p>
                <p className="text-lg font-semibold"></p>
              </div>
              <div className="flex justify-between p-2 rounded-md box-wrapper">
                <p className="text-lg font-semibold">xOS SELECTED</p>
                <p className="text-lg font-semibold"></p>
              </div> */}
              <div className="flex justify-between p-2 rounded-md box-wrapper">
                <p className="text-lg font-semibold">TIME-LOCK</p>
                <div className="text-lg font-semibold text-red-500">
                  <CountDown time={unlockTime} hidden={!userTotalWeight || userTotalWeight?.equalTo(ZERO)} />
                </div>
              </div>
              <p className="mt-2 font-bold text-white bg-[#e62058] p-2 rounded">
                *If you withdraw your PRO before the time-lock period is over you will forfeit 50% of your staked
                PRO/xOWL!
              </p>
            </div>
          ) : (
            <div className="flex flex-col w-full gap-1 p-4 stake-wrap">
              <div className="self-start text-lg font-bold md:text-xl text-high-emphesis md:mb-1">
                {i18n._(t`🌌Space-Time⏲ Lock🔒`)}
              </div>
              <div className="px-2 slider-wrapper">
                <div className="flex items-center justify-between mt-2 -mx-2 font-extrabold labels">
                  <p>1x</p>
                  <p>1.5x</p>
                  <p>7x</p>
                  <p>15x</p>
                  <p>31x</p>
                </div>
                <Slider
                  aria-labelledby="track-inverted-slider"
                  getAriaValueText={valuetext}
                  defaultValue={userLockMode}
                  marks={marks}
                  onChange={(e, value, activeThumb) => {
                    if (isArray(value)) {
                      if (value && value.length > 0) {
                        if (freeLockTime) {
                          if (isForceShortenLockTime) {
                            setLockMode(0)
                          } else {
                            setLockMode(value[0])
                          }
                        } else {
                          if (value[0] >= userLockMode) {
                            setLockMode(value[0])
                          }
                        }
                      }
                    } else {
                      if (freeLockTime) {
                        if (isForceShortenLockTime) {
                          setLockMode(0)
                        } else {
                          setLockMode(value)
                        }
                      } else {
                        if (isLockAmount) {
                          if (value >= userLockMode) {
                            setLockMode(value)
                          }
                        } else {
                          if (value == 0 || value >= userLockMode) {
                            setLockMode(value)
                          }
                        }
                      }
                    }
                  }}
                  sx={{
                    color: '#3b82f6',
                    '& .MuiSlider-markLabel': {
                      color: '#3b82f6',
                      fontWeight: 700,
                    },
                  }}
                  disableSwap={true}
                  // disabled={lockMode < userLockMode}
                  value={lockMode}
                  min={0}
                  max={4}
                  step={1}
                />
              </div>
              {/* <div className="flex justify-between p-2 mt-4 mb-2 rounded-md box-wrapper">
                <p className="text-lg font-semibold">ORACLES SELECTED</p>
                <p className="text-lg font-semibold"></p>
              </div>
              <div className="flex justify-between p-2 rounded-md box-wrapper">
                <p className="text-lg font-semibold">xOS SELECTED</p>
                <p className="text-lg font-semibold"></p>
              </div> */}
            </div>
          )}
          <div className="p-4">
            {toggle ? (
              !account ? (
                <Web3Connect size="lg" color="blue" fullWidth />
              ) : isDepositValid &&
                (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING) ? (
                <Button
                  fullWidth
                  loading={approvalState === ApprovalState.PENDING}
                  color="gradient"
                  onClick={approve}
                  disabled={approvalState !== ApprovalState.NOT_APPROVED}
                >
                  {i18n._(t`Approve`)}
                </Button>
              ) : (
                <Button
                  fullWidth
                  color={!isDepositValid && !!parsedDepositValue ? 'red' : 'blue'}
                  onClick={proDeposit}
                  disabled={!isDepositValid || pendingTx}
                >
                  {depositError || depositButtonString}
                </Button>
              )
            ) : !account ? (
              <Web3Connect color="blue" className="w-full" />
            ) : (
              <Button
                fullWidth
                color={!isWithdrawValid && !!parsedWithdrawValue ? 'red' : 'gradient'}
                onClick={proWithdraw}
                disabled={!isWithdrawValid || pendingTx}
              >
                {withdrawError || i18n._(t`Confirm Withdraw`)}
              </Button>
            )}
          </div>

          <div className="p-4">
            {lockMode > 0 &&
              nftCount > 0 &&
              (xOracleApprovalState === ApprovalState.NOT_APPROVED ||
                xOracleApprovalState === ApprovalState.PENDING) && (
                <Button
                  fullWidth
                  className="mb-2"
                  loading={xOracleApprovalState === ApprovalState.PENDING}
                  color="blue"
                  onClick={xOralceApprove}
                  disabled={xOracleApprovalState !== ApprovalState.NOT_APPROVED}
                >
                  {i18n._(t`Approve xOWL FOR NFT Staking`)}
                </Button>
              )}

            {isForceShortenLockTime ? (
              <Button fullWidth color={'blue'} onClick={resetLockTime} disabled={pendingTx || !account}>
                {i18n._(t`RESET LOCK`)}
              </Button>
            ) : (
              <Button
                fullWidth
                color={'blue'}
                onClick={updateLockTime}
                disabled={
                  pendingTx ||
                  !account ||
                  lockMode === userLockMode ||
                  (lockMode < userLockMode && !freeLockTime) ||
                  !!extendError
                }
              >
                {lockMode >= userLockMode && extendError ? extendError : i18n._(t`Extend Lock`)}
                {/* {lockMode < userLockMode && i18n._(t`Shorten Lock`)} */}
              </Button>
            )}
          </div>
        </div>
        <div className="w-full md:w-[300px] flex flex-col">
          <div className="px-5 mt-4 mb-4 balance bg-dark-900 rounded-3xl py-7 md:mt-0">
            <div className="self-end text-lg font-bold md:text-xl text-high-emphesis md:mb-1">
              {i18n._(t`Stake Balance🥩`)}
            </div>

            <div className="flex items-center pb-1 balance1">
              {/* <Image src="/PRO_Logo3Gold.png" height={32} width={32} alt="true" /> */}
              <img src={PROLOGO.src} width={30} height={30} alt="Logo" />
              <p className="ml-2">{`PRO: ${stakedAmount ? stakedAmount.toSignificant(6) : ''}`}</p>
            </div>
            <div className="flex items-center pb-1 balance2">
              <img src={ProfileIcon.src} height={30} width={30} alt="Profile Icon" />
              <p className="ml-2">{`OWL NFT: ${nftCount}`}</p>
            </div>
            <div className="flex items-center pb-1 balance3">
              <img src={OracleSilverLogo.src} height={30} width={30} alt="Oracle Silver Logo" />
              <p className="ml-2">{`xOWL: ${lockXOracle ? lockXOracle.toSignificant(6) : ''}`}</p>
            </div>
            <p>
              YOUR TOTAL POOL SHARE:
              <br />{' '}
              <span className="text-[#1a9e44]">
                {' '}
                {`${userTotalWeight ? userTotalWeight.toSignificant(6) : ''} = ${rate.toFixed(6)}%`}
              </span>
            </p>
            <div>
              TIME LOCK
              <div>
                <CountDown time={unlockTime} hidden={!userTotalWeight || userTotalWeight?.equalTo(ZERO)} />
              </div>
              {/* <br /> <span className={``}>{timeLock}</span> */}
            </div>
          </div>

          <div className="flex flex-col justify-between flex-1 px-4 py-4 rewards bg-dark-900 rounded-3xl">
            <div className="flex flex-row mb-3">
              <div className="self-start text-lg font-bold md:text-xl text-high-emphesis md:mb-1">
                {i18n._(t`Rewards🌟`)}
              </div>

              <QuestionHelper
                className="!bg-dark-800 !shadow-xl p-2"
                text={`You may notice some tokens called OLP. Each OLP is different and represents a pair. For example: PRO/WSGB, PRO/OWL & PRO/xOWL. Go to Pool > Browse to visualize it.`}
              />
            </div>

            <div className="grid h-full grid-cols-2">
              <div className="ml-2 mr-2 border-r">
                <div className="self-end text-sm md:text-xl text-high-emphesis md:mb-1">{i18n._(t`Claimed`)}</div>

                <div className="flex flex-col">
                  {userTotalReward.map((item, index) => (
                    <p key={`user-rewardinfo-${index}`}>{`${item.token.symbol}: ${
                      item.amount ? item.amount.toSignificant(3) : ''
                    }`}</p>
                  ))}
                </div>
              </div>

              <div>
                <div className="self-end text-sm md:text-xl text-high-emphesis md:mb-1">{i18n._(t`Pending`)}</div>

                <div className="flex flex-col">
                  {userReward.map((item, index) => (
                    <p key={`user-rewardinfo-${index}`}>{`${item.token.symbol}: ${
                      item.amount ? item.amount.toSignificant(3) : ''
                    }`}</p>
                  ))}
                </div>
              </div>
            </div>
            <Button
              className="mt-1"
              fullWidth
              color={'gradient'}
              onClick={proHarvest}
              disabled={!userReward || userReward?.length === 0}
            >
              {i18n._(t`HARVEST`)}
            </Button>
          </div>
        </div>
      </div>

      <HeadlessUiModal.Controlled isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxWidth="md">
        <div className="flex flex-col gap-4">
          <HeadlessUiModal.Header header={i18n._(t`Confirm`)} onClose={() => setShowConfirmation(false)} />
          <HeadlessUiModal.BorderedContent className="flex flex-col gap-3 !border-yellow/40  border-0">
            <Typography variant="lg" weight={700} className="text-white ">
              {i18n._(t`Warning you are about to break your time lock!`)}
            </Typography>
            <Typography variant="sm" weight={700} className="text-red">
              {i18n._(t`You will lose: `)} {parsedWithdrawValue?.divide(2)?.toSignificant(5)} {' PRO'}
            </Typography>
          </HeadlessUiModal.BorderedContent>
          <Button
            id="confirm-expert-mode"
            color="red"
            variant="filled"
            onClick={() => {
              proWithdrawAction()
            }}
          >
            {i18n._(t`Break Lock`)}
          </Button>
        </div>
      </HeadlessUiModal.Controlled>
    </>
  )
}
