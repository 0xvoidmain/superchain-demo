import { Card } from '@/components/ui/card'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useTokenInfo } from '@/hooks/useTokenInfo'

export function TokenInfo() {
  const { 
    symbol, decimals, name, address,
    symbol_B, decimals_B, name_B, address_B
   } = useTokenInfo()
  const { toast } = useToast()

  return (
    <Card className="p-4">
      <div className="text-sm font-medium text-muted-foreground">
        Token Info
      </div>
      <div className="text-2xl font-bold">{symbol}</div>
      <div className="mt-2 space-y-1">
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="w-16">Name:</span>
          <span className="font-medium">{name}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="w-16">Address:</span>
          <div className="flex items-center gap-2">
            <span className="font-medium font-mono truncate max-w-[200px]">
              {address}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                navigator.clipboard.writeText(address)
                toast({
                  description: 'Address copied to clipboard',
                  duration: 2000,
                })
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="w-16">Decimals:</span>
          <span className="font-medium">{decimals}</span>
        </div>
      </div>

      <br/>

      <div className="text-2xl font-bold">{symbol_B}</div>
      <div className="mt-2 space-y-1">
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="w-16">Name:</span>
          <span className="font-medium">{name_B}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="w-16">Address:</span>
          <div className="flex items-center gap-2">
            <span className="font-medium font-mono truncate max-w-[200px]">
              {address_B}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                navigator.clipboard.writeText(address)
                toast({
                  description: 'Address copied to clipboard',
                  duration: 2000,
                })
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="w-16">Decimals:</span>
          <span className="font-medium">{decimals_B}</span>
        </div>
      </div>
    </Card>
  )
}
