import { Address, createPublicClient, parseAbiItem } from 'viem'
import { create } from 'zustand'
import { parseJson, serializeJson } from '../lib/json'
import { envVars } from '@/envVars'

const CHUNK_SIZE = BigInt(1000)

interface ChainTransfer {
  chainId: number
  from: string
  to: string
  value: bigint
  blockNumber: bigint
  tokenAddress: Address
  logIndex: number
  transactionHash: string
}

interface BalanceMap {
  [address: string]: bigint
}

interface ChainBalanceMap {
  [chainId: string]: BalanceMap
}

interface IndexerState {
  transfers: ChainTransfer[]
  lastProcessedBlocks: { [chainId: number]: bigint | null }
  balances: {
    aggregate: BalanceMap
    perChain: ChainBalanceMap
  }
  totalSupply: {
    [chainId: string]: bigint
  }
  addTransfer: (transfer: ChainTransfer) => void
  setLastProcessedBlock: (chainId: number, blockNumber: bigint) => void
}

// Add new constant for storage key
const STORAGE_KEY = 'indexer-state'

// Create Zustand store with persistence
export const useIndexerStore = create<IndexerState>((set) => {
  // Load initial state from localStorage
  let initialState: Partial<IndexerState> = {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      initialState = parseJson(stored)
    }
  } catch (error) {
    console.warn('Failed to load indexer state from localStorage:', error)
  }

  return {
    // Merge default state with stored state
    transfers: initialState.transfers || [],
    lastProcessedBlocks: initialState.lastProcessedBlocks || {},
    balances: initialState.balances || {
      aggregate: {},
      perChain: {},
    },
    totalSupply: initialState.totalSupply || {},

    addTransfer: (transfer) =>
      set(
        (state) => {
          if (state.transfers.find(e => {
            return e.chainId === transfer.chainId && e.transactionHash === transfer.transactionHash && e.logIndex === transfer.logIndex
          })) return state

          const updateBalance = (
            balanceMap: BalanceMap,
            address: string,
            delta: bigint,
          ) => {
            const current = balanceMap[address] || BigInt(0)
            const newBalance = current + delta
            if (
              newBalance < BigInt(0) &&
              address !== '0x0000000000000000000000000000000000000000'
            ) {
              throw new Error(
                `Invalid balance state: ${address} would have negative balance`,
              )
            }
            balanceMap[address] = newBalance
          }

          // Create new balance objects
          const newAggregate = { ...state.balances.aggregate }
          const newPerChain = { ...state.balances.perChain }
          const newTotalSupply = { ...state.totalSupply }

          // Initialize chain balances and total supply if needed
          if (!newPerChain[`${transfer.chainId}-${transfer.tokenAddress}`]) {
            newPerChain[`${transfer.chainId}-${transfer.tokenAddress}`] = {}
          }
          if (!newTotalSupply[`${transfer.chainId}-${transfer.tokenAddress}`]) {
            newTotalSupply[`${transfer.chainId}-${transfer.tokenAddress}`] = BigInt(0)
          }

          // Update total supply if transfer is from/to zero address
          const zeroAddress = '0x0000000000000000000000000000000000000000'
          if (transfer.from === zeroAddress) {
            // Mint
            newTotalSupply[`${transfer.chainId}-${transfer.tokenAddress}`] += transfer.value
          } else if (transfer.to === zeroAddress) {
            // Burn
            newTotalSupply[`${transfer.chainId}-${transfer.tokenAddress}`] -= transfer.value
          }

          // Update sender balance (could go negative for insufficient balance)
          updateBalance(newAggregate, transfer.from, -transfer.value)
          updateBalance(
            newPerChain[`${transfer.chainId}-${transfer.tokenAddress}`],
            transfer.from,
            -transfer.value,
          )

          // Update recipient balance
          updateBalance(newAggregate, transfer.to, transfer.value)
          updateBalance(
            newPerChain[`${transfer.chainId}-${transfer.tokenAddress}`],
            transfer.to,
            transfer.value,
          )

          const newState = {
            transfers: [...state.transfers, transfer],
            lastProcessedBlocks: {
              ...state.lastProcessedBlocks,
              [transfer.chainId]: transfer.blockNumber,
            },
            balances: {
              aggregate: newAggregate,
              perChain: newPerChain,
            },
            totalSupply: newTotalSupply,
          }

          // Persist to localStorage
          try {
            localStorage.setItem(STORAGE_KEY, serializeJson(newState))
          } catch (error) {
            console.warn('Failed to persist indexer state:', error)
          }

          return newState
        },
        false, // Set false to prevent automatic shallow merge
      ),

    setLastProcessedBlock: (chainId, blockNumber) =>
      set((state) => {
        const newState = {
          ...state,
          lastProcessedBlocks: {
            ...state.lastProcessedBlocks,
            [chainId]: blockNumber,
          },
        }

        // Persist to localStorage
        try {
          localStorage.setItem(STORAGE_KEY, serializeJson(newState))
        } catch (error) {
          console.warn('Failed to persist indexer state:', error)
        }

        return newState
      }, false),
  }
})

// Add method to clear storage
export const clearIndexerStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear indexer storage:', error)
  }
}

export const createIndexer = (
  clients: { [chainId: number]: ReturnType<typeof createPublicClient> },
  tokenAddresses: { [chainId: number]: Address[] },
) => {
  const isBackfilling: { [chainId: number]: boolean } = {}

  const resetAllChains = async () => {
    const emptyState = {
      transfers: [],
      lastProcessedBlocks: {},
      balances: {
        aggregate: {},
        perChain: {},
      },
      totalSupply: {},
    }

    // Update store and persist
    useIndexerStore.setState(emptyState)
    try {
      localStorage.setItem(STORAGE_KEY, serializeJson(emptyState))
    } catch (error) {
      console.warn('Failed to persist reset state:', error)
    }

    // Reinitialize all chains using the same logic as initialize()
    await Promise.all(
      Object.entries(clients).map(async ([chainId, client]) => {
        const chainIdNum = Number(chainId)
        const currentBlock = await client.getBlockNumber()
        await backfill(chainIdNum, BigInt(0), currentBlock)
      }),
    )
  }

  const backfill = async (
    chainId: number,
    fromBlock: bigint,
    toBlock: bigint,
  ) => {
    if (isBackfilling[chainId]) return
    isBackfilling[chainId] = true

    try {
      let currentFromBlock = fromBlock
      const client = clients[chainId]
      const tokenAddress = tokenAddresses[chainId]

      while (currentFromBlock <= toBlock) {
        const chunkToBlock = currentFromBlock + CHUNK_SIZE - BigInt(1)
        const effectiveToBlock = chunkToBlock > toBlock ? toBlock : chunkToBlock

        const logs = await client.getLogs({
          address: tokenAddress[0],
          event: parseAbiItem(
            'event Transfer(address indexed from, address indexed to, uint256 value)',
          ),
          fromBlock: currentFromBlock,
          toBlock: effectiveToBlock,
        })

        logs.forEach((log) => {
          const transfer = {
            chainId,
            from: log.args.from as string,
            to: log.args.to as string,
            value: log.args.value as bigint,
            blockNumber: log.blockNumber!,
            tokenAddress: tokenAddress[0],
            logIndex: log.logIndex!,
            transactionHash: log.transactionHash!,
          }
          useIndexerStore.getState().addTransfer(transfer)
        })

        const logs2 = await client.getLogs({
          address: tokenAddress[1],
          event: parseAbiItem(
            'event Transfer(address indexed from, address indexed to, uint256 value)',
          ),
          fromBlock: currentFromBlock,
          toBlock: effectiveToBlock,
        })

        logs2.forEach((log) => {
          const transfer = {
            chainId,
            from: log.args.from as string,
            to: log.args.to as string,
            value: log.args.value as bigint,
            blockNumber: log.blockNumber!,
            logIndex: log.logIndex!,
            transactionHash: log.transactionHash!,
            tokenAddress: tokenAddress[1],
          }
          useIndexerStore.getState().addTransfer(transfer)
        })

        // console.log(chainId, await client.getLogs({
        //   address: envVars.VITE_POOL_CONTRACT_ADDRESS,
        //   event: parseAbiItem(
        //     'event ExecuteCrosschainSwap(uint256 sourceChainId, address tokenA, uint256 amountA, address tokenB, uint256 amountB, uint256 reserveA, uint256 reserveB, address recipient)',
        //   ),
        //   fromBlock: currentFromBlock,
        //   toBlock: effectiveToBlock,
        // }))

        currentFromBlock = effectiveToBlock + BigInt(1)
      }
    } finally {
      isBackfilling[chainId] = false
    }
  }

  // Initialize indexer and perform backfill if needed
  const initialize = async () => {
    await Promise.all(
      Object.entries(clients).map(async ([chainId, client]) => {
        const chainIdNum = Number(chainId)
        const currentBlock = await client.getBlockNumber()
        const lastProcessedBlock =
          useIndexerStore.getState().lastProcessedBlocks[chainIdNum]

        if (!lastProcessedBlock) {
          await backfill(chainIdNum, BigInt(0), currentBlock)
        } else if (lastProcessedBlock < currentBlock) {
          await backfill(
            chainIdNum,
            lastProcessedBlock + BigInt(1),
            currentBlock,
          )
        }
      }),
    )
  }

  // Set up watchers for all chains
  const unwatchers = Object.entries(clients).map(([chainId, client]) => {
    const chainIdNum = Number(chainId)
    return [client.watchEvent({
      address: tokenAddresses[chainIdNum][0],
      event: parseAbiItem(
        'event Transfer(address indexed from, address indexed to, uint256 value)',
      ),
      onLogs: async (logs) => {
        if (!logs.length) return

        logs.forEach((log) => {
          const transfer = {
            chainId: chainIdNum,
            from: log.args.from as string,
            to: log.args.to as string,
            value: log.args.value as bigint,
            blockNumber: log.blockNumber!,
            tokenAddress: tokenAddresses[chainIdNum][0],
            logIndex: log.logIndex!,
            transactionHash: log.transactionHash!,
          }
          useIndexerStore.getState().addTransfer(transfer)
        })
      },
    }), client.watchEvent({
      address: tokenAddresses[chainIdNum][1],
      event: parseAbiItem(
        'event Transfer(address indexed from, address indexed to, uint256 value)',
      ),
      onLogs: async (logs) => {
        if (!logs.length) return

        logs.forEach((log) => {
          const transfer = {
            chainId: chainIdNum,
            from: log.args.from as string,
            to: log.args.to as string,
            value: log.args.value as bigint,
            blockNumber: log.blockNumber!,
            tokenAddress: tokenAddresses[chainIdNum][1],
            logIndex: log.logIndex!,
            transactionHash: log.transactionHash!,
          }
          useIndexerStore.getState().addTransfer(transfer)
        })
      },
    })]
  }).flat()

  return {
    // unwatch: () => unwatchers.forEach((unwatch) => unwatch()),
    unwatch: () => {
      
    },
    store: useIndexerStore,
    initialize: () => {},
    backfill: () => {},
    resetAllChains: () => {},
  }
}
