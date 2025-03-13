import {
  createWalletClient,
  http,
  publicActions,
  getContract,
  Address,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { supersimL2A, supersimL2B } from '@eth-optimism/viem/chains'

import {
  walletActionsL2,
  publicActionsL2,
  createInteropSentL2ToL2Messages,
} from '@eth-optimism/viem'

import greeterData from './abi/GREETER_ABI.mjs'
import greetingSenderData from './abi/GREETER_SENDER_ABI.mjs'  

const account = privateKeyToAccount(process.env.PRIV_KEY as `0x${string}`)

const walletA = createWalletClient({
  chain: supersimL2A,
  transport: http(),
  account
}).extend(publicActions)
  .extend(publicActionsL2())
  .extend(walletActionsL2())

const walletB = createWalletClient({
  chain: supersimL2B,
  transport: http(),
  account
}).extend(publicActions)
  .extend(publicActionsL2())
  .extend(walletActionsL2())

const greeter = getContract({
  address: process.env.GREETER_B_ADDR as Address,
  abi: greeterData,
  client: walletB
})

const greetingSender = getContract({
  address: process.env.GREETER_A_ADDR as Address,
  abi: greetingSenderData,
  client: walletA
})

;(async () => {
  const txnBHash = await greeter.write.setGreeting(
    ["Greeting directly to chain B"])
  await walletB.waitForTransactionReceipt({hash: txnBHash})
  
  const greeting1 = await greeter.read.greet()
  console.log(`Chain B Greeting: ${greeting1}`)
  
  const txnAHash = await greetingSender.write.setGreeting(
    ["Greeting through chain A Tung Hoang"])
  const receiptA = await walletA.waitForTransactionReceipt({hash: txnAHash})
  
  const sentMessage =  
    (await createInteropSentL2ToL2Messages(walletA, { receipt: receiptA }))
        .sentMessages[0]
    
  console.log(sentMessage)
  const relayMsgTxnHash = await walletB.interop.relayMessage({
    sentMessageId: sentMessage.id,
    sentMessagePayload: sentMessage.payload,
    })
  
  const receiptRelay = await walletB.waitForTransactionReceipt(
        {hash: relayMsgTxnHash})
  
  const greeting2 = await greeter.read.greet()
  console.log(`Chain A Greeting: ${greeting2}`)
})();
