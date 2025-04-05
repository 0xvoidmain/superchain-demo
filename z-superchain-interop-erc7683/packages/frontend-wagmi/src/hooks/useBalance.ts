import { L2NativeSuperchainERC20Abi } from '@/abi/L2NativeSuperchainERC20Abi'
import { chains, transports } from '@/config'
import { envVars } from '@/envVars'
import { useEffect } from 'react'
import { createPublicClient } from 'viem'
import { readContract } from 'viem/actions'
import { useReadContracts } from 'wagmi'

export const useBalance = (address: `0x${string}`) => {
  const result = useReadContracts({
    contracts: [
      {
        address: envVars.VITE_TOKEN_A_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'totalSupply',
      },
      {
        address: envVars.VITE_TOKEN_A_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'balanceOf',
        args: [address],
      },
    ]
  })

  const result2 = useReadContracts({
    contracts: [
      {
        address: envVars.VITE_TOKEN_B_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'totalSupply',
      },
      {
        address: envVars.VITE_TOKEN_B_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'balanceOf',
        args: [address],
      },
    ]
  })
  
  const [balance, totalSupply] = result.data || []
  const [balance_B, totalSupply_B] = result2.data || []

  useEffect(() => {
    const id = setInterval(() => {
      result.refetch()
      result2.refetch()
    }, 2000)
    return () => clearInterval(id)
  })

  return {
    totalSupply: totalSupply?.result,
    balance: balance?.result,
    totalSupply_B: totalSupply_B?.result,
    balance_B: balance_B?.result
  }
}
