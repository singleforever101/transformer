'use client'

import '@near-wallet-selector/modal-ui/styles.css'

import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet'

import Big from 'big.js'

import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Tooltip } from 'recharts'

import {
  AccountState,
  Transaction,
  WalletSelector,
  setupWalletSelector,
} from '@near-wallet-selector/core'
import React, { useEffect, useState, PureComponent } from 'react'
import { WalletSelectorModal, setupModal } from '@near-wallet-selector/modal-ui'

import * as nearAPI from 'near-api-js'
import usePolling from 'app/hooks'

const CONTRACT_ID = 'token.trmr-tkn.near'

const CONTRACT_LOTTERY_ID = 'trmr-tkn.near'

const connectionConfig = {
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  walletUrl: 'https://wallet.near.org',
  helperUrl: 'https://api.kitwallet.app',
  explorerUrl: 'https://nearblocks.io',
}

const formteAccount = (accountId: string) => {
  return `${accountId.slice(0, 4)}...${accountId.slice(-4)}`
}

export default function ContractBoard() {
  const [selector, setSelector] = useState<WalletSelector>()

  const [modal, setModal] = useState<WalletSelectorModal>()

  const [signedIn, setSignedIn] = useState<boolean>(false)

  const [yourBalance, setYourBalance] = useState<string>()

  const [players, setPlayers] = useState<string[]>()

  const [bets, setBets] = useState<number[]>()

  const [accounts, setAccounts] = useState<Array<AccountState>>([])

  const [refresh, setRefresh] = useState<boolean>(false)

  const [lotteryRound, setLotteryRound] = useState<string>()

  const [entered, setEntered] = useState<boolean>()

  const [poolSize, setPoolSize] = useState<string>()

  const [enterSize, setEnterSize] = useState<string>()

  const [pieActiveIndex, setPieActiveInedx] = useState<number>(0)

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

    if (!accounts) return

    if (!signedIn) return

    checkNearBalance()
    checkIfEnteredLottery()
  }, [selector, accounts, signedIn])

  const checkPoolInfo = async () => {
    const { connect } = nearAPI

    const nearConnection = await connect(connectionConfig)

    const account = await nearConnection.account(CONTRACT_ID)

    const lotteryRound = account.viewFunction({
      contractId: CONTRACT_LOTTERY_ID,
      methodName: 'get_lottery_round',
    })

    const poolSize = account.viewFunction({
      contractId: CONTRACT_LOTTERY_ID,
      methodName: 'get_prize_pool',
    })

    const players = account.viewFunction({
      contractId: CONTRACT_LOTTERY_ID,
      methodName: 'get_players',
    })

    const bets = account.viewFunction({
      contractId: CONTRACT_LOTTERY_ID,
      methodName: 'get_bets',
    })

    await Promise.all([lotteryRound, poolSize, players, bets]).then((values) => {
      setLotteryRound(values[0].toString())

      const parsedPoolSize = Big(values[1]).div(Big(10).pow(24)).toFixed()

      setPoolSize(parsedPoolSize.toString())
      setPlayers(values[2])
      setBets(values[3])
    })
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

  usePolling(checkPoolInfo)

  const enterLotteryAvailable =
    !!signedIn &&
    typeof nearBalance !== 'undefined' &&
    typeof enterSize === 'string' &&
    !!enterSize &&
    !!nearBalance &&
    Number(enterSize) <= Number(nearBalance) &&
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

    wallet.signAndSendTransactions({
      transactions: transactions,
    })
  }

  const handleSignOut = async () => {
    if (!selector) return

    const wallet = await selector.wallet()

    wallet.signOut().then(() => {
      setRefresh((b) => !b)
      setYourBalance(undefined)
      setNearBalance(undefined)
    })
  }

  const handleSignIn = () => {
    if (typeof window !== 'undefined' && modal) {
      modal.show()
    }
  }

  if (!selector || typeof window === 'undefined') return null

  const data = (bets || []).map((bet, index) => {
    return {
      name: formteAccount(players?.[index] || ''),
      value: parseFloat(new Big(bet).div(Big(10).pow(24)).toFixed(2)),
    }
  })

  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props
    console.log('props: ', props)

    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    const sx = cx + (outerRadius + 10) * cos
    const sy = cy + (outerRadius + 10) * sin
    const mx = cx + (outerRadius + 30) * cos
    const my = cy + (outerRadius + 30) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * 22
    const ey = my
    const textAnchor = cos >= 0 ? 'start' : 'end'

    return (
      <g className="border-none outline-none focus:outline-none">
        <text
          x={cx}
          y={cy - 35}
          dy={8}
          fontSize={24}
          textAnchor="middle"
          fontWeight={60}
          fill="#000"
        >
          Prize Size
        </text>

        <text x={cx} y={cy} dy={8} fontSize={24} textAnchor="middle" fontWeight={60} fill="#000">
          {Big(poolSize || 0)
            .times(0.95)
            .toFixed()}{' '}
          $NEAR
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey + 20}
          dy={18}
          textAnchor={textAnchor}
          fill="#999"
        >
          {payload.name}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
        >{`${value} NEAR`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`${(percent * 100).toFixed(2)}%`}
        </text>
      </g>
    )
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="pt-40">
      <div className="flex  gap-20">
        <div className="flex flex-col items-center ">
          <div className="flex w-full  flex-col items-center gap-5 pt-6">
            {typeof nearBalance === 'string' && (
              <div className="text-md justify-end  border border-none text-center font-normal">
                Your Near Balance: {nearBalance}
              </div>
            )}
            <input
              className=" w-full max-w-[500px]  rounded-2xl border border-black p-4 text-2xl  font-extrabold placeholder:text-sm placeholder:font-normal"
              placeholder={
                entered
                  ? 'You already entered this round'
                  : 'The minimum NEAR to enter lottery is 0.1 NEAR'
              }
              type="text"
              disabled={!signedIn || entered}
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
          <div className="flex items-center justify-center gap-10 pt-6 ">
            <button
              className={`${
                !enterLotteryAvailable && signedIn ? 'cursor-not-allowed ' : ''
              } flex max-w-max flex-shrink-0 items-center justify-between gap-2 rounded-2xl border border-black p-4 py-4 text-3xl  font-extrabold   hover:opacity-30`}
              onClick={!signedIn ? handleSignIn : handleEnterLottery}
            >
              {!signedIn ? 'Sign In To Enter Lottery' : 'Enter Lottery'}
            </button>

            {signedIn && (
              <button
                className={`flex max-w-max flex-shrink-0 items-center justify-between gap-2 rounded-2xl border border-black p-4 py-4 text-3xl  font-extrabold   hover:opacity-30`}
                onClick={handleSignOut}
              >
                {'Sign Out'}
              </button>
            )}
          </div>
        </div>
        <div>
          {typeof lotteryRound === 'string' && (
            <div className="border border-none pt-10 text-center text-3xl font-semibold">
              Current Lottery Round: {lotteryRound}{' '}
              {signedIn ? `(${entered ? 'Already Entered' : 'Not Entered'})` : ''}
            </div>
          )}

          {typeof poolSize === 'string' && (
            <div className="whitespace-nowrap border border-none pt-10 text-center text-3xl font-semibold">
              Current Round Prize Size: {Big(poolSize).times(0.95).toFixed()} $NEAR
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-20 pt-20">
        <table className="max-h-max min-w-[400px] rounded-2xl border-2 border-black">
          <thead>
            <tr className="rounded-tr-2xl border-b border-black bg-black bg-opacity-5">
              <th className="p-2 text-left text-2xl font-semibold">Account Id</th>
              <th className="p-2 text-left text-2xl font-semibold">Bet Amount</th>
              <th className="p-2 text-left text-2xl font-semibold">Share</th>
            </tr>
          </thead>
          <tbody>
            {bets &&
              bets.map((bet, index) => (
                <tr className="border-b border-black" key={index}>
                  <td className="p-2 text-2xl font-semibold">
                    {players && formteAccount(players[index])}
                  </td>
                  <td className="p-2 text-2xl font-semibold ">
                    {Big(bet).div(Big(10).pow(24)).toFixed()} NEAR
                  </td>
                  <td className="whitespace-nowrap p-2 text-2xl font-semibold">
                    {typeof poolSize === 'string' && (
                      <div>
                        {Big(bet).div(Big(poolSize)).div(Big(10).pow(24)).times(100).toFixed(2)} %
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <div className="h-[600px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart className="border-none outline-none active:outline-none">
              <Pie
                activeIndex={pieActiveIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={200}
                outerRadius={250}
                fill="#999"
                dataKey="value"
                onMouseEnter={(_, index) => setPieActiveInedx(index)}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
