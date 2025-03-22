import { L2NativeSuperchainERC20Abi } from '@/abi/L2NativeSuperchainERC20Abi'
import { chains, transports } from '@/config'
import { envVars } from '@/envVars'
import { useEffect, useState } from 'react'
import { createPublicClient } from 'viem'
import { readContract } from 'viem/actions'

export const useBalanceAllChain = (chainId: number, address: `0x${string}`) => {
  const [balance, setBalance] = useState<{
    balance: bigint
    balance_B: bigint
  }>({
    balance: BigInt(0),
    balance_B: BigInt(0),
  })
  const client = createPublicClient({
    chain: chains.find((chain) => chain.id === chainId),
    transport: transports[chainId],
  })

  const fetchBalances = async () => {
    const [balance, balance_B] = await Promise.all([
      readContract(client, {
        address: envVars.VITE_TOKEN_A_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'balanceOf',
        args: [address]
      }),
      readContract(client, {
        address: envVars.VITE_TOKEN_B_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'balanceOf',
        args: [address]
      })
    ])

    setBalance({
      balance: balance,
      balance_B: balance_B,
    })
  }

  useEffect(() => {
    (async() => {
      await fetchBalances()
    })();
    const id = setInterval(async () => {
      await fetchBalances()
    }, 2000)
    return () => clearInterval(id)
  }, [chainId, address])

  return balance
}
