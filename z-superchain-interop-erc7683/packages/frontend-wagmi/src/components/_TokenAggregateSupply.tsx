import { Card } from '@/components/ui/card'
import { formatUnits, zeroAddress } from 'viem'
import { chains } from '@/config'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { truncateDecimals } from '@/lib/truncateDecimals'
import { useBalance } from '@/hooks/useBalance'

export const TokenAggregateSupply = () => {
  const { totalSupply, totalSupply_B } = useBalance(zeroAddress)
  const { symbol, decimals, symbol_B, decimals_B } = useTokenInfo()

  const chainSupplies = chains.map((chain) => ({
    chainId: chain.id,
    chainName: chain.name,
    symbol: symbol ?? 'TOKEN',
    totalSupply: totalSupply ?? BigInt(0),
    decimals: decimals ?? 18,
    initials: chain.name
      .split(' ')
      .map((word: any) => word[0])
      .join('')
      .toUpperCase(),
  }))


  const chainSupplies_B = chains.map((chain) => ({
    chainId: chain.id,
    chainName: chain.name,
    symbol: symbol_B ?? 'TOKEN',
    totalSupply: totalSupply_B ?? BigInt(0),
    decimals: decimals_B ?? 18,
    initials: chain.name
      .split(' ')
      .map((word: any) => word[0])
      .join('')
      .toUpperCase(),
  }))

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">
            Total Supply
          </div>
        </div>

        <div className="space-y-3">
          {chainSupplies.map((chain) => {
            const supply = Number(
              formatUnits(chain.totalSupply, chain.decimals),
            )
            return (
              <div key={chain.chainId} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                    {chain.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">
                          {chain.chainName}
                        </div>
                        {/* <div className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% of total
                        </div> */}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {truncateDecimals(supply, 6)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {chain.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="w-full bg-secondary rounded-full h-1.5">
                  <div
                    className="bg-primary rounded-full h-1.5 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div> */}
              </div>
            )
          })}
          <br/>
          {chainSupplies_B.map((chain) => {
            const supply = Number(
              formatUnits(chain.totalSupply, chain.decimals),
            )

            return (
              <div key={chain.chainId} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                    {chain.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">
                          {chain.chainName}
                        </div>
                        {/* <div className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% of total
                        </div> */}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {truncateDecimals(supply, 6)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {chain.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="w-full bg-secondary rounded-full h-1.5">
                  <div
                    className="bg-primary rounded-full h-1.5 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div> */}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
