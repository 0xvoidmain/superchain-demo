import { Bridge } from '@/components/Bridge'
import { Providers } from '@/Providers'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Faucet } from '@/components/Faucet'
import { ConnectWalletButton } from '@/components/connect-wallet/ConnectWalletButton'
import { TokenInfo } from '@/components/TokenInfo'
import { RecentActivity } from '@/components/RecentActivity'
import { Transfer } from './components/Transfer'
import { Swap } from './components/Swap'
import { NetworkButtons } from './components/NetworkButtons'
import { TokenAggregateSupply } from './components/TokenAggregateSupply'
import { WalletBalance } from './components/WalletBalance'
import { PoolBalance } from './components/PoolBalance'
import { Button } from './components/ui/button'

function App() {
  return (
    <Providers>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold">A8 Superchain-interop CrossSwap | DEMO</h1>
            <div className="flex items-center gap-4">
              <NetworkButtons />
              <ConnectWalletButton />
            </div>
          </div>
        </header>

        <main className="container mx-auto py-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <TokenInfo />
            <TokenAggregateSupply />
            <WalletBalance />
            <PoolBalance />
          </div>

          {/* Main Content */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left Column - Tools */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <Tabs defaultValue="faucet" className="w-full">
                  <div className="px-6 pt-6">
                    <TabsList className="w-full flex">
                      <TabsTrigger value="faucet" className="flex-1">
                        Faucet
                      </TabsTrigger>
                      <TabsTrigger value="bridge" className="flex-1">
                        Bridge
                      </TabsTrigger>
                      <TabsTrigger value="transfer" className="flex-1">
                        Transfer
                      </TabsTrigger>
                      <TabsTrigger value="swap" className="flex-1">
                        Swap
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6">
                    <TabsContent value="bridge">
                      <Bridge />
                    </TabsContent>
                    <TabsContent value="faucet">
                      <Faucet />
                    </TabsContent>
                    <TabsContent value="transfer">
                      <Transfer />
                    </TabsContent>
                    <TabsContent value="swap">
                      <Swap />
                    </TabsContent>
                    <TabsContent value="deploy">
                      {/* Add Contract Deployment interface */}
                      <div className="text-muted-foreground">
                        Contract deployment interface coming soon...
                      </div>
                    </TabsContent>
                    <TabsContent value="verify">
                      {/* Add Contract Verification interface */}
                      <div className="text-muted-foreground">
                        Contract verification interface coming soon...
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            </div>

            <div className="space-y-6">
              {/* <RecentActivity /> */}
              <Card className="p-6">
                <div>
                  <b>OPTIMISM INTEROP ECOSYSTEM</b>
                </div>
                <br/>
                <Button>
                  <a href='https://interop-devnet.superbridge.app/' target='__blank'>
                    Bridge ETH from Sepolia to L2-DEV ONE / L2-DEV TWO
                  </a>
                </Button>
                <br/>
                <br/>
                <Button>
                  <a href='https://console.optimism.io/faucet' target='__blank'>
                    Superchain Faucet
                  </a>
                </Button>
                <br/>
                <br/>
                <Button>
                  <a href='https://docs.optimism.io/stack/interop/tools/devnet' target='__blank'>
                    Interop devnet documentation
                  </a>
                </Button>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </Providers>
  )
}

export default App
