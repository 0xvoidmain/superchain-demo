import { useAccount, useChainId, useChains, useSwitchChain } from 'wagmi'
import { Button } from './ui/button'

export const NetworkButtons = () => {
  const { isConnected } = useAccount()
  const chains = useChains()
  const chainId = useChainId()
  const {switchChain} = useSwitchChain()

  return !isConnected ? <></> : 
    chains.map((chain) => (
      <Button variant="outline" className="gap-2 cursor-pointer" style={{
        backgroundColor: chain.id === chainId ? 'blue' : 'white',
        color: chain.id === chainId ? 'white' : 'black',
      }} key={chain.id} onClick={() => {
        switchChain({
          chainId: chain.id
        })
      }}>
        <span className="text-sm font-medium">{chain.name}</span>
      </Button>
    )
  )
}
