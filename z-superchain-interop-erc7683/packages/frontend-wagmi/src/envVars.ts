import { parseEnv, z } from 'znv'
import { Address as ZodAddress } from 'abitype/zod'
import { deployment } from '@superchainerc20-starter/contracts'
import { Address } from 'viem'

const zAddressWithDefault = (defaultAddress: Address) =>
  z
    .string()
    .default(defaultAddress)
    .transform((val) => {
      const address = val.trim() !== '' ? val : defaultAddress
      return ZodAddress.parse(address)
    })

export const envVars = parseEnv(import.meta.env, {
  VITE_TOKEN_A_CONTRACT_ADDRESS: zAddressWithDefault(deployment.token_a),
  VITE_TOKEN_B_CONTRACT_ADDRESS: zAddressWithDefault(deployment.token_b),
  VITE_TOKEN_MINTER_ADDRESS: zAddressWithDefault(deployment.ownerAddress),
  VITE_WALLET_CONNECT_PROJECT_ID: z.string().optional(),
  VITE_POOL_CONTRACT_ADDRESS: zAddressWithDefault(deployment.pool),
})
