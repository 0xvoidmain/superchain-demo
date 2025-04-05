import { L2NativeSuperchainERC20Abi } from '@/abi/L2NativeSuperchainERC20Abi'
import { chains, transports } from '@/config'
import { envVars } from '@/envVars'
import { useEffect, useState } from 'react'
import { createPublicClient } from 'viem'
import { readContract } from 'viem/actions'

export const useTotalSupplyAllChain = (chainId: number) => {
  const [balance, setBalance] = useState<{
    totalSupply: bigint
    totalSupply_B: bigint
  }>({
    totalSupply: BigInt(0),
    totalSupply_B: BigInt(0),
  })
  const client = createPublicClient({
    chain: chains.find((chain) => chain.id === chainId),
    transport: transports[chainId],
  })

  const fetchBalances = async () => {
    const [totalSupply, totalSupply_B] = await Promise.all([
      readContract(client, {
        address: envVars.VITE_TOKEN_A_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'totalSupply',
        args: []
      }),
      readContract(client, {
        address: envVars.VITE_TOKEN_B_CONTRACT_ADDRESS,
        abi: L2NativeSuperchainERC20Abi,
        functionName: 'totalSupply',
        args: []
      })
    ])

    setBalance({
      totalSupply: totalSupply,
      totalSupply_B: totalSupply_B,
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
  }, [chainId])

  return balance
}
