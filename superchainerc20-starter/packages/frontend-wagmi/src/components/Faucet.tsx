import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAccount, useChainId, useSwitchChain, useWriteContract } from 'wagmi'
import { chains } from '@/config'
import {
  parseUnits,
} from 'viem'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { L2NativeSuperchainERC20Abi } from '@/abi/L2NativeSuperchainERC20Abi'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export const Faucet = () => {
  const account = useAccount()
  const {
    writeContractAsync,
    isPending: isLoading,
    isError
  } = useWriteContract()

  const chainId = useChainId()
  const [targetChainIdString, setTargetChain] = useState(chainId.toString())

  useEffect(() => {
    setTargetChain(chainId.toString())
  }, [chainId])

  const { symbol, decimals = 18, address, address_B, symbol_B } = useTokenInfo()

  const [recipient, setRecipient] = useState(account.address || '')
  const [selectToken, setSelectToken] = useState(address || '')
  
  const [amount, setAmount] = useState<string>('1000')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const {switchChain} = useSwitchChain()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Faucet</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Select Token</Label>
            <Select
              value={selectToken}
              onValueChange={e => setSelectToken(e as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={address}>{symbol} | {address}</SelectItem>
                <SelectItem value={address_B}>{symbol_B} | {address_B}</SelectItem>
              </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
          <Label>Network</Label>
          <Select
            onValueChange={e => {
              setTargetChain(e)
              switchChain({
                chainId: Number(e),
              })
            }}
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
          <Label>Recipient Address</Label>
          <Input
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Amount ({decimals} decimals)</Label>
          <Input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={
            !recipient || isSubmitting || isLoading
          }
          onClick={async () => {
            try {
              setIsSubmitting(true)

              writeContractAsync({
                address: selectToken,
                abi: L2NativeSuperchainERC20Abi,
                functionName: 'mintTo',
                args: [recipient as any, parseUnits(amount, decimals)],
              })
            } 
            catch (error) {
              console.error('Error sending transaction:', error)
            }
            finally {
              setIsSubmitting(false)
            }
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting transactions...
            </>
          ) : isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sent. Waiting for receipt...
            </>
          ) : (
            'Drip Tokens'
          )}
        </Button>

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Error occurred while processing transactions
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
