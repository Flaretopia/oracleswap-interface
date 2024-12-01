import React, { useState, useCallback, useEffect } from 'react'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { useLauncher } from '../../hooks/useLauncher'
import { useActiveWeb3React } from 'app/services/web3'
import { useTransactionAdder } from 'app/state/transactions/hooks'
import Button from 'app/components/Button'
import Typography from 'app/components/Typography'
import Web3Connect from 'app/components/Web3Connect'
import TransactionConfirmationModal from 'app/modals/TransactionConfirmationModal'
import { HeadlessUiModal } from 'app/components/Modal'
import Container from 'app/components/Container'
import Dots from 'app/components/Dots'
import { JSBI, Token, CurrencyAmount } from '@sushiswap/core-sdk'
import { useTokenBalance } from 'app/state/wallet/hooks'
import { useTokenContract } from 'app/hooks/useContract'
import Image from 'next/image'
import { Contract } from '@ethersproject/contracts'
import { ethers } from 'ethers'
import LAUNCHER_ABI from './launcher_abi.json'
import ERC20_ABI from 'app/constants/abis/erc20.json'
const LAUNCHER_ADDRESS = "0xb452cfcfbF012cF74fFe9A04e249f5F505a2b44B"

const MIN_INITIAL_LIQUIDITY = '10000'

const OS_TOKEN = {
  address: '0xD7565b16b65376e2Ddb6c71E7971c7185A7Ff3Ff',
  symbol: 'OS',
  decimals: 18
}

const PRO_TOKEN = {
  address: '0xf810576A68C3731875BDe07404BE815b16fC0B4e',
  symbol: 'PRO',
  decimals: 18
}

export default function TokenLauncher() {
  const { account, chainId, library } = useActiveWeb3React()
  const { createToken, isLoading, nativeFee, osBalance, proBalance } = useLauncher()
  const addTransaction = useTransactionAdder()
  
  const [activeView, setActiveView] = useState<'launcher' | 'tokens'>('launcher')
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    totalSupply: '',
    lpPercent: '95',
    devPercent: '4',
    initialLiquidity: MIN_INITIAL_LIQUIDITY,
    description: '',
    website: '',
    logo: null as File | null,
  })

  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>('')
  const [pendingTx, setPendingTx] = useState(false)
  const [approving, setApproving] = useState(false)

  const [selectedPaymentToken, setSelectedPaymentToken] = useState<'SGB' | 'OS' | 'PRO'>('SGB')
  const [tokenFees, setTokenFees] = useState({
    nativeFee: '0',
    osFee: '0',
    proFee: '0'
  })

  const [osAllowance, setOsAllowance] = useState<CurrencyAmount<Token> | null>(null)
  const [proAllowance, setProAllowance] = useState<CurrencyAmount<Token> | null>(null)

  useEffect(() => {
    const fetchFees = async () => {
      if (!library) return
      const contract = new Contract(LAUNCHER_ADDRESS, LAUNCHER_ABI, library)
      const [nativeFee, osFee, proFee] = await Promise.all([
        contract.nativeFee(),
        contract.tokenFees(OS_TOKEN.address),
        contract.tokenFees(PRO_TOKEN.address)
      ])
      setTokenFees({
        nativeFee: ethers.utils.formatEther(nativeFee),
        osFee: ethers.utils.formatEther(osFee),
        proFee: ethers.utils.formatEther(proFee)
      })
    }
    fetchFees()
  }, [library])

  useEffect(() => {
    const checkAllowances = async () => {
      if (!account || !library) return

      try {
        const osContract = new Contract(OS_TOKEN.address, ERC20_ABI, library)
        const proContract = new Contract(PRO_TOKEN.address, ERC20_ABI, library)

        const [osAllowanceRaw, proAllowanceRaw] = await Promise.all([
          osContract.allowance(account, LAUNCHER_ADDRESS),
          proContract.allowance(account, LAUNCHER_ADDRESS)
        ])

        setOsAllowance(CurrencyAmount.fromRawAmount(
          new Token(chainId || 19, OS_TOKEN.address, OS_TOKEN.decimals),
          osAllowanceRaw.toString()
        ))
        setProAllowance(CurrencyAmount.fromRawAmount(
          new Token(chainId || 19, PRO_TOKEN.address, PRO_TOKEN.decimals),
          proAllowanceRaw.toString()
        ))
      } catch (error) {
        console.error('Error checking allowances:', error)
      }
    }

    checkAllowances()
  }, [account, library, chainId])

  const osContract = useTokenContract(OS_TOKEN.address)
  const proContract = useTokenContract(PRO_TOKEN.address)

  const handleApprove = async () => {
    if (!account || !library) return
    setApproving(true)
    try {
      const contract = selectedPaymentToken === 'OS' ? osContract : proContract
      if (!contract) throw new Error('Contract not found')
      
      const amount = ethers.utils.parseUnits('10000', 18)
      
      const tx = await contract.approve(LAUNCHER_ADDRESS, amount)
      await tx.wait()
    } catch (error) {
      console.error('Error approving token:', error)
    }
    setApproving(false)
  }

  const handleCreateToken = useCallback(async () => {
    if (!account) return
    
    if (!formData.website || !formData.website.trim()) {
      alert('Website link is required')
      return
    }

    if (!formData.website.startsWith('http://') && !formData.website.startsWith('https://')) {
      alert('Website must start with http:// or https://')
      return
    }
    
    setPendingTx(true)
    setShowConfirm(true)

    try {
      const result = await createToken({
        name: formData.name,
        symbol: formData.symbol,
        totalSupply: formData.totalSupply,
        lpPercent: formData.lpPercent,
        devPercent: formData.devPercent,
        initialLiquidity: formData.initialLiquidity,
        description: formData.description,
        website: formData.website,
        logoFile: formData.logo,
        paymentToken: selectedPaymentToken
      })

      if (result.success) {
        // Token creation was successful
        setTxHash(result.hash)
        
        // Reset form
        setFormData({
          name: '',
          symbol: '',
          totalSupply: '',
          lpPercent: '95',
          devPercent: '4',
          initialLiquidity: MIN_INITIAL_LIQUIDITY,
          description: '',
          website: '',
          logo: null,
        })

        // Keep the confirmation modal open to show success
        setPendingTx(false)
        // Don't close the modal - let user see the success state
        // setShowConfirm(false)
      } else {
        // Token creation failed
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Token creation error:', error)
      setPendingTx(false)
      setShowConfirm(false)
      // Remove alert and show error in the UI
      // alert(error.message || 'Failed to create token. Please try again.')
    }
  }, [account, createToken, formData, selectedPaymentToken])

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
  }, [txHash])

  useEffect(() => {
    if (!txHash) return;
    setPendingTx(false);
  }, [txHash])

  const handleLPChange = (value: string) => {
    const lpValue = Number(value)
    if (lpValue >= 0 && lpValue <= 99) {
      setFormData(prev => ({
        ...prev,
        lpPercent: value,
        devPercent: (99 - lpValue).toString()
      }))
    }
  }

  const handleDevChange = (value: string) => {
    const devValue = Number(value)
    if (devValue >= 0 && devValue <= 50) {
      setFormData(prev => ({
        ...prev,
        devPercent: value,
        lpPercent: (99 - devValue).toString()
      }))
    }
  }

  const validateImage = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return 'Logo must be JPG, PNG, or GIF format'
    }

    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      return 'Logo must be under 2MB'
    }

    return null
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validateImage(file)
    if (error) {
      alert(error)
      e.target.value = '' // Reset input
      return
    }

    setFormData(prev => ({ ...prev, logo: file }))
  }

  const needsApproval = (selectedToken: 'OS' | 'PRO') => {
    if (!account) return false
    
    const requiredAmount = ethers.utils.parseUnits(
      selectedToken === 'OS' ? tokenFees.osFee : tokenFees.proFee,
      18
    )
    
    const allowance = selectedToken === 'OS' ? osAllowance : proAllowance
    
    return !allowance || allowance.lessThan(requiredAmount.toString())
  }

  const hasEnoughBalance = useCallback(() => {
    if (!account) return false
    
    try {
      const requiredAmount = ethers.utils.parseEther(
        selectedPaymentToken === 'SGB' 
          ? (Number(formData.initialLiquidity) + Number(nativeFee)).toString()
          : '10' // 10 tokens required for OS/PRO
      )

      if (selectedPaymentToken === 'SGB') {
        // Handle SGB balance check
        return library?.getBalance(account).then(balance => 
          balance.gte(requiredAmount)
        ) || false
      } else {
        // Handle OS/PRO balance check
        const balance = selectedPaymentToken === 'OS' ? osBalance : proBalance
        if (!balance) return false
        
        // Convert the required amount to match the SDK's format
        const requiredCurrencyAmount = CurrencyAmount.fromRawAmount(
          new Token(
            chainId || 19,
            selectedPaymentToken === 'OS' ? OS_TOKEN.address : PRO_TOKEN.address,
            18
          ),
          requiredAmount.toString()
        )
        
        return balance.greaterThan(requiredCurrencyAmount)
      }
    } catch (error) {
      console.error('Error checking balance:', error)
      return false
    }
  }, [account, selectedPaymentToken, formData.initialLiquidity, nativeFee, osBalance, proBalance, library, chainId])

  const [canCreate, setCanCreate] = useState(false)

  useEffect(() => {
    const checkBalance = async () => {
      const result = await hasEnoughBalance()
      setCanCreate(result)
    }
    checkBalance()
  }, [hasEnoughBalance])

  return (
    <Container id="launcher-page" className="py-4 md:py-8 lg:py-12" maxWidth="7xl">
      <div className="max-w-4xl mx-auto mb-8">
        <Typography 
          variant="hero" 
          className="text-high-emphesis text-center text-sm sm:text-lg md:text-2xl lg:text-4xl font-bold"
        >
          🎇Token Launcher BETA
        </Typography>
      </div>
      
      <div className="flex flex-wrap max-w-4xl mx-auto">
        <div className="w-full md:w-[calc(100%-316px)] md:mr-4">
          <div className="bg-dark-900 rounded p-4">
            <div className="flex flex-col gap-4">
              <Typography variant="h3" weight={700} className="text-high-emphesis mb-4">
                {i18n._(t`Launch Your Token`)}
              </Typography>

              <Typography variant="sm" className="text-secondary">
                Launch your own token! 
                There is a {nativeFee} SGB fee to launch a token and there is a 1% fee on created token supply, min 10% of fees are distributed to OS stakers!
                Minimum liquidity of {MIN_INITIAL_LIQUIDITY} SGB and 50% of the token supply is required.
                Liquidity is automatically added to OracleSwap and then burnt!
              </Typography>

              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="w-[200px]">
                    <Typography variant="lg" className="text-secondary mb-2">
                      🖼️ Token Logo*
                    </Typography>
                    <div className="bg-dark-800 rounded aspect-square relative">
                      <div className="flex flex-col items-center justify-center w-full h-full p-4">
                        {formData.logo ? (
                          <div className="relative w-full h-full">
                            <img
                              src={URL.createObjectURL(formData.logo)}
                              alt="Token Logo Preview"
                              className="w-full h-full object-contain"
                            />
                            <button
                              onClick={() => setFormData(prev => ({ ...prev, logo: null }))}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red flex items-center justify-center hover:bg-red/80 transition-colors"
                            >
                              <span className="text-white text-sm">×</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-500 rounded">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/gif"
                              className="hidden"
                              id="logo-upload"
                              onChange={handleLogoChange}
                            />
                            <label htmlFor="logo-upload" className="cursor-pointer text-center">
                              <Typography variant="sm" className="text-secondary">
                                Click to upload logo
                                <br />
                                <span className="text-xs">(JPG, PNG, or GIF under 2MB)</span>
                              </Typography>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Typography variant="lg" className="text-grey">🏷️ Token Name *</Typography>
                      <div className="bg-dark-900 rounded p-2">
                        <input
                          className="w-full p-2 rounded bg-dark-800 text-grey text-sm border border-dark-700 focus:border-blue"
                          placeholder="e.g. Ethereum"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Typography variant="lg" className="text-grey">💎 Token Symbol *</Typography>
                      <div className="bg-dark-900 rounded p-2">
                        <input
                          className="w-full p-2 rounded bg-dark-800 text-grey text-sm border border-dark-700 focus:border-blue"
                          placeholder="e.g. ETH"
                          value={formData.symbol}
                          onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Typography variant="lg" className="text-grey">📊 Total Supply *</Typography>
                      <div className="bg-dark-900 rounded p-2">
                        <input
                          className="w-full p-2 rounded bg-dark-800 text-grey text-sm border border-dark-700 focus:border-blue"
                          type="number"
                          placeholder="e.g. 1000000"
                          value={formData.totalSupply}
                          onChange={(e) => setFormData(prev => ({ ...prev, totalSupply: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Typography variant="lg" className="text-grey">🔥 LP Allocation % *</Typography>
                    <div className="bg-dark-900 rounded p-2">
                      <input
                        className="w-full p-2 rounded bg-dark-800 text-grey text-sm border border-dark-700 focus:border-blue"
                        type="number"
                        placeholder="Maximum 99%"
                        value={formData.lpPercent}
                        onChange={(e) => handleLPChange(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Typography variant="lg" className="text-grey">💻 Dev Allocation % *</Typography>
                    <div className="bg-dark-900 rounded p-2">
                      <input
                        className="w-full p-2 rounded bg-dark-800 text-grey text-sm border border-dark-700 focus:border-blue"
                        type="number"
                        placeholder="Maximum 50%"
                        value={formData.devPercent}
                        onChange={(e) => handleDevChange(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Typography variant="lg" className="text-grey">💰 Initial Liquidity (SGB) *</Typography>
                    <div className="bg-dark-900 rounded p-2">
                      <input
                        className="w-full p-2 rounded bg-dark-800 text-grey text-sm border border-dark-700 focus:border-blue"
                        type="number"
                        min={MIN_INITIAL_LIQUIDITY}
                        placeholder={`Minimum ${MIN_INITIAL_LIQUIDITY} SGB`}
                        value={formData.initialLiquidity}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (value >= Number(MIN_INITIAL_LIQUIDITY)) {
                            setFormData(prev => ({ ...prev, initialLiquidity: e.target.value }))
                          }
                        }}
                      />
                    </div>
                    <Typography variant="xs" className="text-secondary">
                      Minimum initial liquidity: {MIN_INITIAL_LIQUIDITY} SGB
                    </Typography>
                  </div>

                  <div className="space-y-2">
                    <Typography variant="lg" className="text-grey">🌐 Link *</Typography>
                    <div className="bg-dark-900 rounded p-2">
                      <input
                        className="w-full p-2 rounded bg-dark-800 text-grey text-sm border border-dark-700 focus:border-blue"
                        placeholder="e.g. https://example.com"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                    <Typography variant="xs" className="text-secondary">
                      Must include https:// or http://
                    </Typography>
                  </div>

                  <div className="space-y-2">
                    <Typography variant="lg" className="text-grey">📝 Description</Typography>
                    <div className="bg-dark-900 rounded p-2">
                      <textarea
                        className="w-full p-2 rounded bg-dark-800 text-grey text-sm border border-dark-700 focus:border-blue"
                        placeholder="Describe your token..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 md:w-[300px] md:mt-0">
          <div className="bg-dark-900 rounded p-4">
            <Typography variant="h3" weight={700} className="text-high-emphesis mb-4">
              {i18n._(t`Token Preview`)}
            </Typography>

            {formData.logo && (
              <img
                src={URL.createObjectURL(formData.logo)}
                alt="Token Logo Preview"
                className="w-16 h-16 mx-auto rounded-full"
              />
            )}

            <div className="space-y-2">
              <Typography variant="sm">Name: {formData.name || '-'}</Typography>
              <Typography variant="sm">Symbol: {formData.symbol || '-'}</Typography>
              <Typography variant="sm">Total Supply: {formData.totalSupply ? Number(formData.totalSupply).toLocaleString() : '-'}</Typography>
              <Typography variant="sm">Website: {formData.website || '-'}</Typography>
              <Typography variant="sm">Description: {formData.description || '-'}</Typography>
            </div>

            <div className="border-t border-dark-700 pt-4 space-y-2">
              <Typography variant="sm">🔥 LP: {formData.lpPercent}% ({formData.totalSupply ? (Number(formData.totalSupply) * Number(formData.lpPercent) / 100).toLocaleString() : '-'} tokens)</Typography>
              <Typography variant="sm">💻 Dev: {formData.devPercent}% ({formData.totalSupply ? (Number(formData.totalSupply) * Number(formData.devPercent) / 100).toLocaleString() : '-'} tokens)</Typography>
              <Typography variant="sm">🏦 Fee: 1% ({formData.totalSupply ? (Number(formData.totalSupply) * 0.01).toLocaleString() : '-'} tokens)</Typography>
              <Typography variant="sm">Initial Liquidity: {formData.initialLiquidity} SGB</Typography>
            </div>

            <div className="border-t border-dark-700 pt-4 space-y-4">
              <Typography variant="lg" className="text-grey">Payment Token</Typography>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPaymentToken('SGB')}
                  className={`flex items-center gap-2 p-2 rounded ${
                    selectedPaymentToken === 'SGB' ? 'bg-blue' : 'bg-dark-800'
                  }`}
                >
                  <Image 
                    src="/SGB.png" 
                    width={24} 
                    height={24} 
                    alt="SGB"
                    unoptimized={true}
                    onError={(e) => {
                      console.error('Error loading SGB image');
                      e.currentTarget.src = '/images/tokens/unknown.png';
                    }}
                  />
                  <span>SGB</span>
                </button>
                
                <button
                  onClick={() => setSelectedPaymentToken('OS')}
                  className={`flex items-center gap-2 p-2 rounded ${
                    selectedPaymentToken === 'OS' ? 'bg-blue' : 'bg-dark-800'
                  }`}
                >
                  <Image 
                    src="/ORACLE.png" 
                    width={24} 
                    height={24} 
                    alt="OS"
                    unoptimized={true}
                    onError={(e) => {
                      console.error('Error loading OS image');
                      e.currentTarget.src = '/images/tokens/unknown.png';
                    }}
                  />
                  <span>OS</span>
                </button>
                
                <button
                  onClick={() => setSelectedPaymentToken('PRO')}
                  className={`flex items-center gap-2 p-2 rounded ${
                    selectedPaymentToken === 'PRO' ? 'bg-blue' : 'bg-dark-800'
                  }`}
                >
                  <Image 
                    src="/PRO.png" 
                    width={24} 
                    height={24} 
                    alt="PRO"
                    unoptimized={true}
                    onError={(e) => {
                      console.error('Error loading PRO image');
                      e.currentTarget.src = '/images/tokens/unknown.png';
                    }}
                  />
                  <span>PRO</span>
                </button>
              </div>

              <div className="space-y-2">
                <Typography variant="sm">
                  Fee: {selectedPaymentToken === 'SGB' ? tokenFees.nativeFee : 
                        selectedPaymentToken === 'OS' ? tokenFees.osFee :
                        tokenFees.proFee} {selectedPaymentToken}
                </Typography>
                
                {selectedPaymentToken !== 'SGB' && needsApproval(selectedPaymentToken) && (
                  <Button
                    color="blue"
                    onClick={handleApprove}
                    disabled={approving}
                  >
                    {approving ? 'Approving...' : 'Approve'}
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4">
              {!account ? (
                <Web3Connect size="lg" color="blue" className="w-full" />
              ) : (
                <Button
                  fullWidth
                  color="blue"
                  onClick={handleCreateToken}
                  disabled={pendingTx || !canCreate}
                >
                  {!canCreate 
                    ? `Insufficient ${selectedPaymentToken} Balance`
                    : pendingTx 
                      ? <Dots>Uploading Token Metadata</Dots>
                      : 'Create Token'
                  }
                </Button>
              )}
            </div>
          </div>
        </div>

        {showConfirm && (
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={pendingTx}
            hash={txHash}
            content={() => (
              <HeadlessUiModal.Header
                header={pendingTx 
                  ? i18n._(t`Uploading Token Metadata...`) 
                  : txHash 
                    ? i18n._(t`Transaction Submitted`) 
                    : i18n._(t`Confirm Token Creation`)}
                onClose={handleDismissConfirmation}
              />
            )}
            pendingText={i18n._(t`Creating ${formData.symbol} token and uploading metadata please be patient...`)}
          />
        )}
      </div>
    </Container>
  )
}


























