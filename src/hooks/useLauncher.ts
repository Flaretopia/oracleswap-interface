import { useCallback, useState, useEffect } from 'react';

import { ethers, Contract } from 'ethers';

import { useActiveWeb3React } from 'app/services/web3';

import { storage, db } from '../config/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc } from 'firebase/firestore'

import { useTransactionAdder } from 'app/state/transactions/hooks'; // Add this import

import axios from 'axios';

import { useTokenContract } from 'app/hooks/useContract'
import { useTokenBalance } from 'app/state/wallet/hooks'
import { Token } from '@sushiswap/core-sdk'

const LAUNCHER_ADDRESS = "0xb452cfcfbF012cF74fFe9A04e249f5F505a2b44B";

const TOKEN_LIST_URL = "https://raw.githubusercontent.com/nexusportal/token-list/main/tokens.json";

// Add interface for event type
interface TokenCreatedEvent {
  event: string
  args: {
    tokenAddress: string
    name: string
    symbol: string
    totalSupply: string
    launchTime: number
  }
}

interface PairCreatedEvent {
  event: string
  args: {
    pair: string
    token0: string
    token1: string
  }
}

export interface TokenMetadata {
  chainId: string
  description: string
  devAllocation: string
  initialLiquidity: string
  launchDate: Date  // Firestore timestamp
  logoUrl: string
  lpAddress: string
  lpAllocation: string
  symbol: string
  tokenAddress: string
  website: string
  name: string
  totalSupply: string  // Add this field
  creatorAddress: string  // Add this field
}

// Add a debug logging helper
const debug = (step: string, data?: any) => {
  console.group(`🚀 Token Launch - ${step}`);
  console.log('Timestamp:', new Date().toISOString());
  if (data) {
    console.log('Data:', data);
  }
  console.groupEnd();
};

// Add payment token type
type PaymentToken = 'SGB' | 'OS' | 'PRO'

// Add complete ERC20 ABI
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// Add PAIR ABI for price calculations
const PAIR_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
];

// Add LAUNCHER ABI
const LAUNCHER_ABI = [
  "function nativeFee() view returns (uint256)",
  "function tokenFees(address) view returns (uint256)",
  "function createToken(string memory name, string memory symbol, uint256 totalSupply, uint256 lpPercent, uint256 devPercent, address paymentToken, uint256 initialLiquidity, bool useNativeFee) payable",
  "event TokenCreated(address tokenAddress, string name, string symbol, uint256 totalSupply)",
  "event PairCreated(address indexed token0, address indexed token1, address pair)"
];

export const useLauncher = () => {

  const { account, chainId, library } = useActiveWeb3React();
  const addTransaction = useTransactionAdder(); // Add this hook

  const [isLoading, setIsLoading] = useState(false);
  const [nativeFee, setNativeFee] = useState<string>('1'); // Default value

  // Add token contracts
  const osContract = useTokenContract('0xD7565b16b65376e2Ddb6c71E7971c7185A7Ff3Ff')
  const proContract = useTokenContract('0xf810576A68C3731875BDe07404BE815b16fC0B4e')

  // Get token balances
  const osBalance = useTokenBalance(
    account ?? undefined,
    new Token(chainId || 19, '0xD7565b16b65376e2Ddb6c71E7971c7185A7Ff3Ff', 18)
  )
  const proBalance = useTokenBalance(
    account ?? undefined,
    new Token(chainId || 19, '0xf810576A68C3731875BDe07404BE815b16fC0B4e', 18)
  )

  const checkBalance = useCallback(async (paymentToken: string, requiredAmount: ethers.BigNumber) => {
    if (!account || !library) return false

    try {
      if (paymentToken === 'SGB') {
        const balance = await library.getBalance(account)
        return balance.gte(requiredAmount)
      } else {
        const balance = paymentToken === 'OS' ? osBalance : proBalance
        if (!balance) return false
        return balance.greaterThan(requiredAmount.toString())
      }
    } catch (error) {
      console.error('Error checking balance:', error)
      return false
    }
  }, [account, library, osBalance, proBalance])

  // Add useEffect to fetch nativeFee when component mounts
  useEffect(() => {
    const fetchNativeFee = async () => {
      if (!library) return
      try {
        const contract = new Contract(LAUNCHER_ADDRESS, LAUNCHER_ABI, library)
        const fee = await contract.nativeFee()
        const formattedFee = ethers.utils.formatEther(fee)
        console.log('Fetched native fee from contract:', formattedFee)
        setNativeFee(formattedFee)
      } catch (error) {
        console.error('Error fetching native fee:', error)
      }
    }
    fetchNativeFee()
  }, [library])

  const saveTokenMetadata = async (tokenData: TokenMetadata) => {
    try {
      console.log('Saving token metadata:', tokenData)
      const docRef = await addDoc(collection(db, 'tokens'), {
        ...tokenData,
        // Convert the ISO string to a Firestore timestamp
        launchDate: new Date(tokenData.launchDate),
        createdAt: new Date() // Current timestamp
      })
      console.log('Document written with ID: ', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('Error saving token metadata:', error)
      throw error
    }
  }

  const uploadLogo = async (file: File, tokenSymbol: string): Promise<string> => {
    const storageRef = ref(storage, `token-logos/${tokenSymbol.toLowerCase()}.png`)
    await uploadBytes(storageRef, file)
    return getDownloadURL(storageRef)
  }

  const createToken = useCallback(async ({
    name,
    symbol,
    totalSupply,
    lpPercent,
    devPercent,
    initialLiquidity,
    description,
    website,
    logoFile,
    paymentToken = 'SGB'
  }) => {
    debug('Starting Token Creation Process')
    
    if (!library || !account) {
      throw new Error('Wallet not connected')
    }
    
    setIsLoading(true)

    try {
      debug('Preparing Contract Interaction')
      const signer = library.getSigner()
      const contract = new Contract(LAUNCHER_ADDRESS, LAUNCHER_ABI, signer)

      const totalSupplyInWei = ethers.utils.parseUnits(totalSupply, 18)
      const liquidityInWei = ethers.utils.parseEther(initialLiquidity)

      let paymentTokenAddress = ethers.constants.AddressZero
      let paymentAmount = '0'
      let value = '0'
      let requiredBalance = ethers.BigNumber.from('0')

      if (paymentToken === 'SGB') {
        value = liquidityInWei.add(ethers.utils.parseEther(nativeFee)).toString()
        paymentTokenAddress = ethers.constants.AddressZero
        requiredBalance = ethers.BigNumber.from(value)
      } else {
        paymentTokenAddress = paymentToken === 'OS' 
          ? '0xD7565b16b65376e2Ddb6c71E7971c7185A7Ff3Ff'
          : '0xf810576A68C3731875BDe07404BE815b16fC0B4e'
        value = liquidityInWei.toString()
        const tokenFee = await contract.tokenFees(paymentTokenAddress)
        paymentAmount = tokenFee.toString()
        requiredBalance = ethers.BigNumber.from(paymentAmount)
      }

      // Check balance before proceeding
      const hasBalance = await checkBalance(paymentToken, requiredBalance)
      if (!hasBalance) {
        throw new Error(`Insufficient ${paymentToken} balance. Required: ${ethers.utils.formatEther(requiredBalance)} ${paymentToken}`)
      }

      debug('Contract Parameters', {
        name,
        symbol,
        totalSupplyInWei: totalSupplyInWei.toString(),
        lpPercent: Number(lpPercent),
        devPercent: Number(devPercent),
        paymentTokenAddress,
        liquidityInWei: liquidityInWei.toString(),
        useNativeFee: paymentToken === 'SGB',
        value,
        paymentAmount
      })

      // Estimate gas first
      const gasEstimate = await contract.estimateGas.createToken(
        name,
        symbol,
        totalSupplyInWei,
        Number(lpPercent),
        Number(devPercent),
        paymentTokenAddress,
        liquidityInWei,
        paymentToken === 'SGB',
        { value }
      )

      debug('Gas Estimate', { gasEstimate: gasEstimate.toString() })

      // Add 20% to gas estimate
      const gasLimit = gasEstimate.mul(120).div(100)

      const tx = await contract.createToken(
        name,
        symbol,
        totalSupplyInWei,
        Number(lpPercent),
        Number(devPercent),
        paymentTokenAddress,
        liquidityInWei,
        paymentToken === 'SGB',
        { 
          value,
          gasLimit 
        }
      )

      debug('Transaction Sent', { hash: tx.hash })
      
      // Add transaction to pending transactions
      addTransaction(tx, {
        summary: `Creating ${symbol} token`,
      })

      const receipt = await tx.wait()
      
      // Process events and get addresses
      const tokenCreatedEvent = receipt.events?.find(
        (e: any) => e.event === 'TokenCreated'
      )
      
      if (!tokenCreatedEvent || !tokenCreatedEvent.args) {
        throw new Error('TokenCreated event not found in transaction receipt')
      }

      const tokenAddress = tokenCreatedEvent.args.tokenAddress
      const launchTime = tokenCreatedEvent.args.launchTime || Math.floor(Date.now() / 1000)

      // Find LP address
      let lpAddress
      const pairCreatedEvent = receipt.events?.find(
        (e: any) => e.event === 'PairCreated'
      )

      if (pairCreatedEvent && pairCreatedEvent.args) {
        lpAddress = pairCreatedEvent.args.pair
      } else {
        const pairCreatedLog = receipt.logs?.find(
          (log: any) => log.topics[0] === '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'
        )
        if (pairCreatedLog) {
          const abiCoder = new ethers.utils.AbiCoder()
          const decodedData = abiCoder.decode(['address'], pairCreatedLog.data)
          lpAddress = decodedData[0]
        }
      }

      if (!lpAddress) {
        throw new Error('Could not find LP address in transaction receipt')
      }

      // Upload logo and save metadata
      let logoUrl = ''
      try {
        logoUrl = await uploadLogo(logoFile, symbol)
        debug('Logo Upload Complete', { logoUrl })
      } catch (uploadError) {
        console.error('Logo upload failed:', uploadError)
        logoUrl = '/images/tokens/unknown.png'
      }

      const metadata: TokenMetadata = {
        name,
        symbol,
        tokenAddress,
        lpAddress,
        description: description || '',
        website: website || '',
        logoUrl,
        launchDate: new Date(launchTime * 1000),
        lpAllocation: lpPercent.toString(),
        devAllocation: devPercent.toString(),
        initialLiquidity: initialLiquidity.toString(),
        chainId: chainId?.toString() || '19',
        totalSupply: totalSupply.toString(),
        creatorAddress: account
      }

      let docId
      try {
        docId = await saveTokenMetadata(metadata)
        debug('Metadata Saved', { docId })
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError)
        // Don't throw, just continue
      }

      // Return success result
      return {
        success: true,
        hash: tx.hash,
        tokenAddress,
        lpAddress,
        launchTime,
        docId
      }

    } catch (error: any) {
      debug('Error in Token Creation Process', error)
      setIsLoading(false)
      
      // Format error message for user
      let errorMessage = 'Failed to create token. '
      if (error?.data?.message) {
        errorMessage += error.data.message
      } else if (error?.message) {
        errorMessage += error.message
      } else {
        errorMessage += 'Please try again.'
      }
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
      debug('Process Finished')
    }
  }, [library, account, chainId, addTransaction, nativeFee, checkBalance])

  const fetchHoldersCount = async (tokenAddress: string) => {
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        const response = await axios.get(
          `https://songbird-explorer.flare.network/api/v2/tokens/${tokenAddress}/counters`,
          {
            timeout: 5000, // 5 second timeout
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          }
        )
        
        if (response.data && response.data.token_holders_count) {
          return parseInt(response.data.token_holders_count)
        }
        
        return 0
      } catch (error) {
        attempt++
        if (attempt === maxRetries) {
          console.error('Error fetching holders count:', error)
          return 0
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
    
    return 0
  }

  return {
    createToken,
    isLoading,
    nativeFee,
    osBalance,
    proBalance
  };
};
