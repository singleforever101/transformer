'use client'

import '@near-wallet-selector/modal-ui/styles.css'

import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet'

import numeral from 'numeral'

import Big from 'big.js'

import {
  AccountState,
  Transaction,
  WalletSelector,
  setupWalletSelector,
} from '@near-wallet-selector/core'
import React, { useEffect, useState } from 'react'
import { WalletSelectorModal, setupModal } from '@near-wallet-selector/modal-ui'

import * as nearAPI from 'near-api-js'

const CONTRACT_ID = 'token.trmr-tkn.near'

const CONTRACT_LOTTERY_ID = 'trmr-tkn.near'

const connectionConfig = {
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  walletUrl: 'https://wallet.near.org',
  helperUrl: 'https://api.kitwallet.app',
  explorerUrl: 'https://nearblocks.io',
}

export default function ContractBoard() {
  const [selector, setSelector] = useState<WalletSelector>()

  const [modal, setModal] = useState<WalletSelectorModal>()

  const [signedIn, setSignedIn] = useState<boolean>(false)

  const [minted, setMinted] = useState<boolean>(false)

  const [yourBalance, setYourBalance] = useState<string>()

  const [mintedDone, setMintedDone] = useState<boolean>(false)

  const [accounts, setAccounts] = useState<Array<AccountState>>([])

  const [minting, setMinting] = useState<boolean>(false)

  const [refresh, setRefresh] = useState<boolean>(false)

  const [mintedAmount, setMintedAmount] = useState<string>()

  const [lotteryRound, setLotteryRound] = useState<string>()

  const [entered, setEntered] = useState<boolean>()

  const [poolSize, setPoolSize] = useState<string>()

  const [enterSize, setEnterSize] = useState<string>()

  const [nearBalance, setNearBalance] = useState<string>()

  useEffect(() => {
    setupWalletSelector({
      network: 'mainnet',
      modules: [setupMyNearWallet()],
    }).then(async (selector) => {
      setSelector(selector)

      const _modal = setupModal(selector, {
        contractId: CONTRACT_ID,
      })
      const state = selector.store.getState()
      setAccounts(state.accounts)

      setSignedIn(state.accounts.length > 0)

      setSelector(selector)

      setModal(_modal)
    })
  }, [refresh])

  useEffect(() => {
    if (!selector) return
    checkMinted()
  }, [selector, minting])

  useEffect(() => {
    if (!selector) return
    checkMintedDone()
  }, [minted, minting, selector])

  useEffect(() => {
    if (!selector) return

    if (!accounts) return

    if (!signedIn) return

    checkBalance()
    checkNearBalance()

    checkIfEnteredLottery()
  }, [selector, accounts, signedIn])

  const mintableAmount = '100000000'

  useEffect(() => {
    checkMintedAmount()
  }, [])

  useEffect(() => {
    checkLotterySize()
  }, [])

  const checkMintedAmount = async () => {
    // check if one account is minted

    const { connect } = nearAPI

    const nearConnection = await connect(connectionConfig)

    const account = await nearConnection.account(CONTRACT_ID)

    const totalSupply = await account.viewFunction({
      contractId: CONTRACT_ID,
      methodName: 'ft_total_supply',
      args: {},
    })

    const readableMintedAmount = BigInt(totalSupply) / BigInt(10 ** 18) - BigInt(900000000)

    setMintedAmount(readableMintedAmount.toString())
  }

  const checkLotterySize = async () => {
    const { connect } = nearAPI

    const nearConnection = await connect(connectionConfig)

    const account = await nearConnection.account(CONTRACT_ID)

    const lotteryRound = await account.viewFunction({
      contractId: CONTRACT_LOTTERY_ID,
      methodName: 'get_lottery_round',
    })

    const poolSize = await account.viewFunction({
      contractId: CONTRACT_LOTTERY_ID,
      methodName: 'get_prize_pool',
    })

    const parsedPoolSize = Big(poolSize).div(Big(10).pow(24)).toFixed()
    setLotteryRound(lotteryRound.toString())
    setPoolSize(parsedPoolSize.toString())
  }

  const checkBalance = async () => {
    if (!selector) return

    const accountId = accounts?.[0]?.accountId

    if (!accountId) return

    const { connect } = nearAPI

    const nearConnection = await connect(connectionConfig)

    const account = await nearConnection.account(accountId)

    const balance = await account.viewFunction({
      contractId: CONTRACT_ID,
      methodName: 'ft_balance_of',
      args: {
        account_id: accountId,
      },
    })

    const metadata = await account.viewFunction({
      contractId: CONTRACT_ID,
      methodName: 'ft_metadata',
      args: {},
    })

    const readableBalance = BigInt(balance) / BigInt(10 ** metadata.decimals)

    setYourBalance(readableBalance.toString())
  }

  const checkNearBalance = async () => {
    if (!selector) return

    const accountId = accounts?.[0]?.accountId

    if (!accountId) return

    const { connect } = nearAPI

    const nearConnection = await connect(connectionConfig)

    const account = await nearConnection.account(accountId)

    setNearBalance(
      nearAPI.utils.format.formatNearAmount((await account.getAccountBalance()).available)
    )
  }

  const checkIfEnteredLottery = async () => {
    if (!selector) return

    const accountId = accounts?.[0]?.accountId

    if (!accountId) return

    const { connect } = nearAPI

    const nearConnection = await connect(connectionConfig)

    const account = await nearConnection.account(accountId)

    const entered = await account.viewFunction({
      contractId: CONTRACT_LOTTERY_ID,
      methodName: 'already_entered',
      args: {
        account_id: accountId,
      },
    })

    setEntered(entered)
  }

  const handleMint = async () => {
    if (!selector || minted || mintedDone) return

    setMinting(true)

    const wallet = await selector.wallet()

    const accountId = accounts[0].accountId

    const { connect } = nearAPI

    const nearConnection = await connect(connectionConfig)

    const account = await nearConnection.account(accountId)

    const transactions: Transaction[] = []

    const registerStorageDeposit = await account.viewFunction({
      contractId: CONTRACT_ID,
      methodName: 'storage_balance_of',
      args: {
        account_id: accountId,
      },
    })

    if (!registerStorageDeposit) {
      transactions.push({
        signerId: accountId,
        receiverId: CONTRACT_ID,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'storage_deposit',
              args: {
                account_id: accountId,
                registration_only: true,
              },
              gas: '300000000000000',
              deposit: nearAPI.utils.format.parseNearAmount('0.00125') || '0',
            },
          },
        ],
      })
    }

    transactions.push({
      signerId: accountId,
      receiverId: CONTRACT_ID,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: 'mint_ft',
            args: {},
            gas: '300000000000000',
            deposit: '0',
          },
        },
      ],
    })

    wallet
      .signAndSendTransactions({
        transactions: transactions,
      })

      .finally(() => {
        setMinting(false)
      })
  }

  const enterLotteryAvailable =
    !!signedIn &&
    typeof yourBalance !== 'undefined' &&
    typeof enterSize === 'string' &&
    !!enterSize &&
    !!yourBalance &&
    Number(enterSize) <= Number(yourBalance) &&
    Number(enterSize) >= 0.1 &&
    !entered

  const handleEnterLottery = async () => {
    if (!selector || !enterLotteryAvailable) return

    const wallet = await selector.wallet()

    const accountId = accounts[0].accountId

    const transactions: Transaction[] = []

    transactions.push({
      signerId: accountId,
      receiverId: CONTRACT_LOTTERY_ID,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: 'enter_lottery',
            args: {},
            gas: '300000000000000',
            deposit:
              nearAPI.utils.format.parseNearAmount(parseFloat(enterSize || '0').toString()) || '0',
          },
        },
      ],
    })

    wallet
      .signAndSendTransactions({
        transactions: transactions,
      })
      .finally(() => {
        setMinting(false)
      })
  }

  const handleSignOut = async () => {
    if (!selector) return

    const wallet = await selector.wallet()

    wallet.signOut().then(() => {
      setRefresh((b) => !b)
      setMinted(false)
      setMinting(false)
      setMintedDone(false)
      setYourBalance(undefined)
      setNearBalance(undefined)
    })
  }

  const checkMinted = async () => {
    if (!selector) return

    const accountId = accounts?.[0]?.accountId

    if (!accountId) return

    // check if one account is minted

    const { connect } = nearAPI

    const nearConnection = await connect(connectionConfig)

    const account = await nearConnection.account(accountId)

    const minted = await account.viewFunction({
      contractId: CONTRACT_ID,
      methodName: 'check_minted',
      args: {
        account_id: accountId,
      },
    })

    setMinted(!!minted)
  }

  const checkMintedDone = async () => {
    if (!selector) return

    const accountId = accounts?.[0]?.accountId

    if (!accountId) return

    // check if one account is minted

    const { connect } = nearAPI

    const nearConnection = await connect(connectionConfig)

    const account = await nearConnection.account(accountId)

    const mintedDone = await account.viewFunction({
      contractId: CONTRACT_ID,
      methodName: 'mint_done',
      args: {},
    })

    setMintedDone(mintedDone)
  }

  const handleSignIn = () => {
    if (typeof window !== 'undefined' && modal) {
      modal.show()
    }
  }

  if (!selector || typeof window === 'undefined') return null

  return (
    <div className="flex  justify-between pt-10">
      <div className="">
        <div className="flex items-center justify-center gap-10">
          <button
            className={`${
              minted || minting ? 'cursor-not-allowed ' : ''
            } flex max-w-max flex-shrink-0 items-center justify-between gap-2 rounded-2xl border border-black p-4 py-4 text-3xl  font-extrabold   hover:opacity-30`}
            onClick={!signedIn ? handleSignIn : handleMint}
          >
            {!signedIn ? 'Sign In To Mint' : minted ? 'Minted' : 'Mint Now!'}
          </button>

          {signedIn && (
            <button
              className="flex max-w-max flex-shrink-0 items-center justify-between gap-2 rounded-2xl border border-black p-4 py-4 text-3xl font-semibold   hover:opacity-30"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          )}
        </div>

        {mintedDone && (
          <div className="border border-none pt-10 text-center text-3xl font-semibold">
            The total mintable amount has been reached!
          </div>
        )}

        {typeof yourBalance !== 'undefined' && (
          <div className="border border-none pt-10 text-center text-3xl font-semibold">
            Your $TRMR Balance: {numeral(yourBalance).format('0,0')} !
          </div>
        )}

        {typeof mintedAmount === 'string' && (
          <div className="border border-none pt-10 text-center text-3xl font-semibold">
            Minted: {numeral(mintedAmount).format('0,0')} / {numeral(mintableAmount).format('0,0')}
          </div>
        )}
      </div>

      <div className="flex flex-col  items-center">
        <div className="flex items-center justify-center gap-10 ">
          <button
            className={`${
              !enterLotteryAvailable ? 'cursor-not-allowed ' : ''
            } flex max-w-max flex-shrink-0 items-center justify-between gap-2 rounded-2xl border border-black p-4 py-4 text-3xl  font-extrabold   hover:opacity-30`}
            onClick={!signedIn ? handleSignIn : handleEnterLottery}
          >
            {!signedIn ? 'Sign In To Enter Lottery' : 'Enter Lottery'}
          </button>
        </div>

        <div className="flex w-full  flex-col items-center gap-5 pt-6">
          {typeof nearBalance === 'string' && (
            <div className="text-md justify-end  border border-none text-center font-normal">
              Your Near Balance: {nearBalance}
            </div>
          )}
          <input
            className=" w-full max-w-[500px]  rounded-2xl border border-black p-4 text-2xl  font-extrabold placeholder:text-sm placeholder:font-normal"
            placeholder="The minimum NEAR to enter lottery is 0.1 NEAR"
            type="text"
            value={enterSize || ''}
            onChange={(e) => {
              const targetValue = e.target.value
              if (targetValue !== '' && !targetValue.match(/^\d*(\.\d*)?$/)) {
                return
              }
              const amountIn = targetValue.replace(/^0+/, '0') // remove prefix

              setEnterSize(amountIn)
            }}
          />
        </div>

        {typeof lotteryRound === 'string' && (
          <div className="border border-none pt-10 text-center text-3xl font-semibold">
            Current Lottery Round: {lotteryRound}{' '}
            {signedIn ? `(${entered ? 'Entered' : 'Not Entered'})` : ''}
          </div>
        )}

        {typeof poolSize === 'string' && (
          <div className="border border-none pt-10 text-center text-3xl font-semibold">
            Current Round Prize Size: {Big(poolSize).times(0.95).toFixed()} $NEAR
          </div>
        )}
      </div>
    </div>
  )
}
