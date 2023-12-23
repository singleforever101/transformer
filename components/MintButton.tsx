'use client'

import '@near-wallet-selector/modal-ui/styles.css'

import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet'

import {
  AccountState,
  Transaction,
  WalletSelector,
  setupWalletSelector,
} from '@near-wallet-selector/core'
import React, { useEffect, useState } from 'react'
import { WalletSelectorModal, setupModal } from '@near-wallet-selector/modal-ui'

import * as nearAPI from 'near-api-js'

const CONTRACT_ID = 'dev-1703291878677-57597051379657'

const connectionConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://testnet.mynearwallet.com/',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
}

export default function MintButton() {
  const [selector, setSelector] = useState<WalletSelector>()

  const [modal, setModal] = useState<WalletSelectorModal>()

  const [signedIn, setSignedIn] = useState<boolean>(false)

  const [minted, setMinted] = useState<boolean>(false)
  const [accounts, setAccounts] = useState<Array<AccountState>>([])

  const [minting, setMinting] = useState<boolean>(false)

  const [refresh, setRefresh] = useState<boolean>(false)

  useEffect(() => {
    setupWalletSelector({
      network: 'testnet',
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

  const handleMint = async () => {
    if (!selector || minted) return

    setMinting(true)

    const wallet = await selector.wallet()

    const accountId = accounts[0].accountId

    const { connect } = nearAPI

    const nearConnection = await connect(connectionConfig)

    const account = await nearConnection.account(accountId)

    const registered = await account.viewFunction({
      contractId: CONTRACT_ID,
      methodName: 'storage_balance_of',
      args: {
        account_id: accountId,
      },
    })

    const transactions: Transaction[] = []

    if (!registered) {
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
              deposit: nearAPI.utils.format.parseNearAmount('0.002') || '1',
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
            methodName: 'mint',
            args: {},
            gas: '300000000000000',
            deposit: '1',
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

  const handleSignIn = () => {
    if (typeof window !== 'undefined' && modal) {
      modal.show()
    }
  }

  if (!selector || typeof window === 'undefined') return null

  return (
    <>
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
    </>
  )
}
