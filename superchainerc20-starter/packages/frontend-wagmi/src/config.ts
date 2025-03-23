import { createConfig, http } from 'wagmi'
import { optimismSepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'
import { privateKeyToAccount } from 'viem/accounts'

import { HttpTransport } from 'viem'
import { devAccount } from './connectors/devAccount'

const supersimL2A = {
  ...JSON.parse(
    JSON.stringify(optimismSepolia)
  ),
  contracts: {
    disputeGameFactory: {
        1: {
            address: "0xe5965Ab5962eDc7477C8520243A95517CD252fA9"
        },
    },
    l2OutputOracle: {
        1: {
            address: "0xdfe97868233d1aa22e815a266982f2cf17685a27",
        },
    },
    multicall3: {
        address: "0xca11bde05977b3631167028862be2a173976ca11",
        blockCreated: 4286263,
    },
    portal: {
        1: {
            address: "0xbEb5Fc579115071764c7423A4f12eDde41f106Ed",
        },
    },
    l1StandardBridge: {
        1: {
            address: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
        },
    },
    gasPriceOracle: {
        address: "0x420000000000000000000000000000000000000F",
    },
    l1Block: {
        address: "0x4200000000000000000000000000000000000015",
    },
    l2CrossDomainMessenger: {
        address: "0x4200000000000000000000000000000000000007",
    },
    l2Erc721Bridge: {
        address: "0x4200000000000000000000000000000000000014",
    },
    l2StandardBridge: {
        address: "0x4200000000000000000000000000000000000010",
    },
    l2ToL1MessagePasser: {
        address: "0x4200000000000000000000000000000000000016",
    },
  },
  id: 420120000,
  name: 'L2-DEV ONE',
  sourceId: 11155111,
  rpcUrls: {
    default: {
      http: ['https://interop-alpha-0.optimism.io']
    }
  }
}

const supersimL2B = {
  ...JSON.parse(
    JSON.stringify(optimismSepolia)
  ),
  contracts: {
    disputeGameFactory: {
        1: {
            address: "0xe5965Ab5962eDc7477C8520243A95517CD252fA9"
        },
    },
    l2OutputOracle: {
        1: {
            address: "0xdfe97868233d1aa22e815a266982f2cf17685a27",
        },
    },
    multicall3: {
        address: "0xca11bde05977b3631167028862be2a173976ca11",
        blockCreated: 4286263,
    },
    portal: {
        1: {
            address: "0xbEb5Fc579115071764c7423A4f12eDde41f106Ed",
        },
    },
    l1StandardBridge: {
        1: {
            address: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
        },
    },
    gasPriceOracle: {
        address: "0x420000000000000000000000000000000000000F",
    },
    l1Block: {
        address: "0x4200000000000000000000000000000000000015",
    },
    l2CrossDomainMessenger: {
        address: "0x4200000000000000000000000000000000000007",
    },
    l2Erc721Bridge: {
        address: "0x4200000000000000000000000000000000000014",
    },
    l2StandardBridge: {
        address: "0x4200000000000000000000000000000000000010",
    },
    l2ToL1MessagePasser: {
        address: "0x4200000000000000000000000000000000000016",
    },
  },
  id: 420120001,
  name: 'L2-DEV TWO ',
  sourceId: 11155111,
  rpcUrls: {
    default: {
      http: ['https://interop-alpha-1.optimism.io']
    }
  }
}

export const chains = [supersimL2A, supersimL2B] as const

export const transports = Object.fromEntries(
  chains.map((chain) => [chain.id, http()])
) as Record<(typeof chains)[number]['id'], HttpTransport>

// Default dev account (for testing)
export const defaultDevAccount = privateKeyToAccount(
//   '0x97863b0e44341942e32b42751f751bbfcaa4c3da0223118af8ebb2e18383551a'
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'
  // (prompt("Please enter your private key", '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') as any
)

export const config = createConfig({
  chains,
  transports,
  connectors: [
    // devAccount(defaultDevAccount),
    metaMask()
  ],
})
