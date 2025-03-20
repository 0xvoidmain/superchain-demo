import { useState } from 'react'
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
import { parseUnits } from 'viem'
import { contracts } from '@eth-optimism/viem'
import {
  useAccount,
  useSimulateContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { SuperchainTokenBridgeAbi } from '@/abi/SuperchainTokenBridgeAbi'
import { SelectSimple } from './ui/input_select'
import { L2NativeSuperchainERC20Abi } from '@/abi/L2NativeSuperchainERC20Abi'

export const Transfer = () => {
  const { address } = useAccount()
  const { symbol, decimals = 18, address: address_A, address_B, symbol_B, SYMBOLS } = useTokenInfo()
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState<any>('')
  const [selectToken, setSelectToken] = useState<any>(address_A || '')
  const amountUnits = parseUnits(amount, decimals)
  const [sourceChainIdString, setSourceChain] = useState(
    chains[0].id.toString(),
  )
  const sourceChainId = parseInt(sourceChainIdString)
  const [targetChainIdString, setTargetChain] = useState(
    chains[1].id.toString(),
  )
  const targetChainId = parseInt(targetChainIdString)

  const { switchChain } = useSwitchChain()

  const simulationResult = useSimulateContract({
    abi: SuperchainTokenBridgeAbi,
    address: contracts.superchainTokenBridge.address,
    functionName: 'sendERC20',
    args: [
      selectToken,
      recipient,
      amountUnits,
      BigInt(targetChainId),
    ],
    chainId: sourceChainId,
  })

  const simulationTransferResult = useSimulateContract({
    abi: L2NativeSuperchainERC20Abi,
    address: selectToken,
    functionName: 'transfer',
    args: [
      recipient,
      amountUnits
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

  const isLoading = isSendPending || isReceiptLoading || (!simulationResult.data?.request && !simulationTransferResult.data?.request)

  const isButtonDisabled = !address || !amount || !recipient || isLoading

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Transfer {SYMBOLS[selectToken]}</h2>
        <p className="text-sm text-muted-foreground">
          Transfer assets to other between networks
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Token</Label>
            <SelectSimple
              value={selectToken}
              onChange={(e) => setSelectToken(e.target.value as any)}
              >
                <option value={address_A}>{symbol} | {address_A}</option>
                <option value={address_B}>{symbol_B} | {address_B}</option>
              </SelectSimple>
          </div>
          <div className="space-y-2">
            <Label>Recipient Address</Label>
            <Input
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Amount of {SYMBOLS[selectToken]}</Label>
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={isButtonDisabled}
          onClick={() => {
            sourceChainId == targetChainId ? writeContract(simulationTransferResult.data!.request) : writeContract(simulationResult.data!.request)
          }}
        >
          {isSendPending || isReceiptLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : (
            'Send'
          )}
        </Button>
      </div>
    </div>
  )
}
