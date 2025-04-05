import { Card } from '@/components/ui/card'
import { formatUnits, zeroAddress } from 'viem'
import { chains } from '@/config'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { truncateDecimals } from '@/lib/truncateDecimals'
import { useBalanceAllChain } from '@/hooks/useBalanceAllChain'
import { envVars } from '@/envVars'

export const PoolBalance = () => {
  const address = envVars.VITE_POOL_CONTRACT_ADDRESS
  const { toast } = useToast()

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-4)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      description: 'Address copied to clipboard',
      duration: 2000,
    })
  }

  const {
    balance,
    balance_B
  } = useBalanceAllChain(chains[0].id, address || zeroAddress)

  const {
    balance: balance_2,
    balance_B: balance_B_2
  } = useBalanceAllChain(chains[1].id, address || zeroAddress)
  const { symbol, symbol_B, decimals } = useTokenInfo()

  // Return early if no address is connected
  if (!address) {
    return (
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">
          Connect your wallet to view balances
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 justify-between">
            <div className="text-sm font-medium text-muted-foreground">
              Pool Balance
            </div>
            {address && (
              <div
                className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-muted-foreground/80"
                onClick={() => copyToClipboard(address)}
              >
                {truncateAddress(address)}
                <Copy className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-muted-foreground">
            Network: <span style={{color: 'black'}}>{
              chains[0].name
            }</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">
                      {symbol}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {truncateDecimals(Number(formatUnits(balance, decimals || 18)), 4)}
                    </div>
                    {/* <div className="text-xs text-muted-foreground">
                      {balanceA.symbol}
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">
                      {symbol_B}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {truncateDecimals(Number(formatUnits(balance_B, decimals || 18)), 4)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <br/>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-muted-foreground">
            Network: <span style={{color: 'black'}}>{
              chains[1].name
            }</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">
                      {symbol}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {truncateDecimals(Number(formatUnits(balance_2, decimals || 18)), 4)}
                    </div>
                    {/* <div className="text-xs text-muted-foreground">
                      {balanceA.symbol}
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">
                      {symbol_B}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {truncateDecimals(Number(formatUnits(balance_B_2, decimals || 18)), 4)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
