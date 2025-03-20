import { L2NativeSuperchainERC20Abi } from '@/abi/L2NativeSuperchainERC20Abi'
import { envVars } from '@/envVars'
import { useReadContracts } from 'wagmi'

export const useTokenInfo = () => {
  const result = useReadContracts({
    contracts: [
      {
        address: envVars.VITE_TOKEN_A_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'symbol',
      },
      {
        address: envVars.VITE_TOKEN_A_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'decimals',
      },
      {
        address: envVars.VITE_TOKEN_A_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'name',
      },
      {
        address: envVars.VITE_TOKEN_A_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'totalSupply',
      },
    ],
  })

  const result2 = useReadContracts({
    contracts: [
      {
        address: envVars.VITE_TOKEN_B_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'symbol',
      },
      {
        address: envVars.VITE_TOKEN_B_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'decimals',
      },
      {
        address: envVars.VITE_TOKEN_B_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'name',
      },
      {
        address: envVars.VITE_TOKEN_B_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'totalSupply',
      },
    ],
  })
  const [symbol, decimals, name, totalSupply] = result.data || []
  const [symbo_B, decimals_B, name_B, totalSupply_B] = result2.data || []

  return {
    address: envVars.VITE_TOKEN_A_CONTRACT_ADDRESS,
    symbol: symbol?.result,
    decimals: decimals?.result,
    name: name?.result,
    totalSupply: totalSupply?.result,

    symbol_B: symbo_B?.result,
    decimals_B: decimals_B?.result,
    name_B: name_B?.result, 
    address_B: envVars.VITE_TOKEN_B_CONTRACT_ADDRESS,
    totalSupply_B: totalSupply_B?.result,

    SYMBOLS: {
      [envVars.VITE_TOKEN_A_CONTRACT_ADDRESS]: symbol?.result,
      [envVars.VITE_TOKEN_B_CONTRACT_ADDRESS]: symbo_B?.result,
    }
  }
}
