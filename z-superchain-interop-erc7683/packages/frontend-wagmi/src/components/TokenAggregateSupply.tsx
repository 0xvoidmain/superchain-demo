import { Card } from '@/components/ui/card'
import { formatUnits, zeroAddress } from 'viem'
import { chains } from '@/config'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { useAccount, useChainId } from 'wagmi'
import { Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { truncateDecimals } from '@/lib/truncateDecimals'
import { useBalanceAllChain } from '@/hooks/useBalanceAllChain'
import { useTotalSupplyAllChain } from '@/hooks/useTotalSupplyAllChain'

export const TokenAggregateSupply = () => {
  const { address } = useAccount()
  const { toast } = useToast()

  const {
    totalSupply,
    totalSupply_B
  } = useTotalSupplyAllChain(chains[0].id)

  const {
    totalSupply: totalSupply_2,
    totalSupply_B: totalSupply_B_2
  } = useTotalSupplyAllChain(chains[1].id)
  const { symbol, symbol_B, decimals } = useTokenInfo()

  // Return early if no address is connected

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 justify-between">
            <div className="text-sm font-medium text-muted-foreground">
              Total Supply
            </div>
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
                      {truncateDecimals(Number(formatUnits(totalSupply, decimals || 18)), 4)}
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
                      {truncateDecimals(Number(formatUnits(totalSupply_B, decimals || 18)), 4)}
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
                      {truncateDecimals(Number(formatUnits(totalSupply_2, decimals || 18)), 4)}
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
                      {truncateDecimals(Number(formatUnits(totalSupply_B_2, decimals || 18)), 4)}
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
