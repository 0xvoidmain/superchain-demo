import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { chains } from '@/config'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { formatUnits, parseUnits, zeroAddress } from 'viem'
import {
  useAccount,
  useChainId,
  useReadContracts,
  useSimulateContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { envVars } from '@/envVars'
import { SuperPoolAbi } from '@/abi/SuperPoolAbi'
import { L2NativeSuperchainERC20Abi } from '@/abi/L2NativeSuperchainERC20Abi'

export const Swap = () => {
  const { address } = useAccount()
  const { symbol, decimals = 18, address: address_A, address_B, symbol_B, SYMBOLS } = useTokenInfo()
  const [amount, setAmount] = useState('')
  const [fromToken, setFromToken] = useState<any>(address_A || '')
  const [toToken, setToToken] = useState<any>(address_B || '')
  const amountUnits = parseUnits(amount.toString(), decimals)
  const chainId = useChainId()
  const [sourceChainIdString, setSourceChain] = useState(chainId?.toString())
  const sourceChainId = parseInt(sourceChainIdString)
  const [targetChainIdString, setTargetChain] = useState(
    chains.find((chain) => chain.id !== sourceChainId)?.id.toString(),
  )
  const targetChainId = parseInt(targetChainIdString)

  const sourceChain = chains.find((chain) => chain.id === sourceChainId)
  const targetChain = chains.find((chain) => chain.id === targetChainId)


  useEffect(() => {
    setSourceChain(chainId.toString())
    setTargetChain(
      chains.find((chain) => chain.id !== chainId)?.id.toString() || '',
    )
  }, [chainId])

  const { switchChain } = useSwitchChain()


  const result = useReadContracts({
    contracts: [
      {
        address: envVars.VITE_POOL_CONTRACT_ADDRESS,
        abi: SuperPoolAbi,
        args: [fromToken, parseUnits(amount.toString(), decimals), toToken],
        functionName: 'estimateReceiveAmount',
        chainId: targetChainId
      },
      {
        address: fromToken,
        abi: L2NativeSuperchainERC20Abi,
        args: [address || zeroAddress, envVars.VITE_POOL_CONTRACT_ADDRESS],
        functionName: 'allowance',
        chainId: sourceChainId
      }
    ],
  })

  const simulationResult = useSimulateContract({
    abi: SuperPoolAbi,
    address: envVars.VITE_POOL_CONTRACT_ADDRESS,
    functionName: 'swap',
    args: [
      fromToken,
      amountUnits,
      toToken,
    ],
    chainId: sourceChainId,
  })

  const simulationCrossSwapResult = useSimulateContract({
    abi: SuperPoolAbi,
    address: envVars.VITE_POOL_CONTRACT_ADDRESS,
    functionName: 'crosschainSwap',
    args: [
      targetChainId,
      fromToken,
      amountUnits,
      toToken,
    ],
    chainId: sourceChainId,
  })

  const simulationApproveResult = useSimulateContract({
    abi: L2NativeSuperchainERC20Abi,
    address: fromToken,
    functionName: 'approve',
    args: [
      envVars.VITE_POOL_CONTRACT_ADDRESS,
      parseUnits('9999999999', decimals)
    ],
    chainId: sourceChainId,
  })

  const {
    data: hash,
    isPending: isSendPending,
    writeContract,
    reset,
  } = useWriteContract()

  const handleSourceChainChange = async (chainId: string) => {
    try {
      // Attempt to switch chain first
      await switchChain({ chainId: parseInt(chainId) })

      // Only update the state if chain switch was successful
      setSourceChain(chainId)
      if (chainId === targetChainIdString) {
        const availableChains = chains.filter(
          (chain) => chain.id.toString() !== chainId,
        )
        setTargetChain(availableChains[0]?.id.toString() || '')
      }

      reset()
    } catch (error) {
      console.error('Failed to switch chain:', error)
      // Don't update the source chain if switching failed
    }
  }

  const { isLoading: isReceiptLoading } = useWaitForTransactionReceipt({
    hash,
  })

  const isButtonDisabled =
    !address || !amount || !sourceChain || !targetChain || isReceiptLoading || (!simulationResult.data?.request && !simulationCrossSwapResult.data?.request)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Swap token</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>From Network</Label>
              <Select
                onValueChange={handleSourceChainChange}
                value={sourceChainIdString}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From Token</Label>
                <Select
                  value={fromToken}
                  onValueChange={e => setFromToken(e as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={address_A}>{symbol} | {address_A}</SelectItem>
                    <SelectItem value={address_B}>{symbol_B} | {address_B}</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
              <Label>Swap Amount of {SYMBOLS[fromToken]}</Label>
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>To Network</Label>
              <Select
                onValueChange={setTargetChain}
                disabled={!sourceChainIdString}
                value={targetChainIdString}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To Token</Label>
                <Select
                  value={toToken}
                  onValueChange={e => setToToken(e as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={address_A}>{symbol} | {address_A}</SelectItem>
                    <SelectItem value={address_B}>{symbol_B} | {address_B}</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label>Receive Amount of {SYMBOLS[toToken]}</Label>
              <Input
                type="number"
                placeholder="0.0"
                value={formatUnits(BigInt(((result.data || [])[0]?.result || '0') as any), decimals)}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Button
            className="w-full"
            size="lg"
            disabled={isSendPending || isReceiptLoading || (
              Number(formatUnits(BigInt(((result.data || [])[1]?.result || '0') as any), decimals)) > Number(amount)
            ) }
            onClick={() => {
              writeContract(simulationApproveResult.data!.request)
            }}
          >
            {isSendPending || isReceiptLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              'Approve'
            )}
          </Button>
          <Button
            className="w-full"
            size="lg"
            disabled={isButtonDisabled}
            onClick={() => {
              targetChainId == sourceChainId ? writeContract(simulationResult.data!.request) : writeContract(simulationCrossSwapResult.data!.request)
            }}
          >
            {isSendPending || isReceiptLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              'Swap'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
