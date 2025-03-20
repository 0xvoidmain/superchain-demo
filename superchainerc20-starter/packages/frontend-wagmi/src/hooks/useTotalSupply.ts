import { L2NativeSuperchainERC20Abi } from '@/abi/L2NativeSuperchainERC20Abi'
import { envVars } from '@/envVars'
import { useReadContracts } from 'wagmi'

export const useTokenInfo = (address: `0x${string}`) => {
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
    ],
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
    ],
  })
  const [balance, totalSupply] = result.data || []
  const [balance_B, totalSupply_B] = result2.data || []

  return {
    totalSupply: totalSupply?.result,
    balance: balance?.result,
    totalSupply_B: totalSupply_B?.result,
    balance_B: balance_B?.result
  }
}
