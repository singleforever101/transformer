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
import { NEAR_ICON } from 'app/constants'

import { CONTRACT_ID } from 'app/constants'

import { CONTRACT_LOTTERY_ID } from 'app/constants'

import { connectionConfig } from 'app/constants'

const formateAccount = (accountId: string) => {
  if (accountId.endsWith('.near') || accountId.endsWith('.testnet')) {
    return accountId
  }

  return `${accountId.slice(0, 4)}...${accountId.slice(-4)}`
}

export default function ContractBoard() {
  const [selector, setSelector] = useState<WalletSelector>()

  const [modal, setModal] = useState<WalletSelectorModal>()

  const [signedIn, setSignedIn] = useState<boolean>(false)

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
      network: connectionConfig.networkId as 'mainnet' | 'testnet',
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
      name: formateAccount(players?.[index] || ''),
      value: parseFloat(new Big(bet).div(Big(10).pow(24)).toFixed(2)),
    }
  })

  const noData = typeof bets !== 'undefined' && data instanceof Array && data.length === 0

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

    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    const mx = cx + (outerRadius + 30) * cos
    const my = cy + (outerRadius + 30) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * (cos >= 0 ? 10 : -10)
    const ey = my
    const textAnchor = cos >= 0 ? 'start' : 'end'

    return (
      <g className="z-50 border-none outline-none focus:outline-none" stroke="none">
        <text
          x={cx}
          y={cy - 35}
          dy={8}
          fontSize={32}
          textAnchor="middle"
          fontWeight={60}
          fill="#000"
        >
          Prize Size
        </text>

        <text x={cx} y={cy} dy={8} fontSize={32} textAnchor="middle" fontWeight={60} fill="#000">
          {Big(poolSize || 0)
            .times(0.95)
            .toFixed()}{' '}
          NEAR
        </text>

        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="none"
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
          stroke="none"
        />
        {/* <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" /> */}
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey + 20}
          dy={18}
          textAnchor={textAnchor}
          fill="#000"
        >
          {payload.name}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#000"
        >{`${value} NEAR`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#000">
          {`${(percent * 100).toFixed(2)}%`}
        </text>
      </g>
    )
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="  relative grid grid-cols-4 gap-24 pt-40">
      <div className=" relative col-span-2 flex w-[600px] flex-col items-center rounded-xl border-2 border-black  bg-gray-200 bg-opacity-70 shadow-lg">
        {typeof lotteryRound === 'string' && (
          <div className="absolute left-4 top-4 border border-none  text-center text-3xl font-semibold">
            Round {lotteryRound}{' '}
          </div>
        )}

        <div className="relative h-[650px] w-[600px]  py-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart className="border-none outline-none active:outline-none">
              <Pie
                activeIndex={pieActiveIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                overflow={'visible'}
                innerRadius={150}
                outerRadius={200}
                fill="#999"
                dataKey="value"
                paddingAngle={2}
                onMouseEnter={(_, index) => setPieActiveInedx(index)}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {noData && (
          <div className="absolute top-1/2 text-3xl font-semibold">No Players in this round</div>
        )}

        <div className="absolute bottom-4 right-4 text-sm text-black">
          {Big(poolSize || 0)
            .times(0.05)
            .toFixed()}{' '}
          NEAR (5%) for protocol fee
        </div>
      </div>
      <div className=" col-span-2 flex flex-col gap-6  ">
        <div className="flex min-h-[280px] gap-20 rounded-xl border-2 border-black bg-gray-200 bg-opacity-70 p-4 px-8">
          <div className="flex w-full flex-col ">
            <div className="flex w-full  flex-col  gap-5 ">
              {typeof nearBalance === 'string' && (
                <div className="text-md relative justify-end border border-none text-right font-normal">
                  <div className="absolute left-0 top-0 font-bold">
                    {formateAccount(accounts?.[0]?.accountId || '')}
                  </div>

                  <img
                    width={24}
                    height={24}
                    className="mx-2 mb-1 inline-block rounded-full border border-black"
                    src={NEAR_ICON}
                  />

                  {Big(nearBalance).toFixed(6)}
                </div>
              )}
              {signedIn && (
                <input
                  className=" w-full max-w-[500px] rounded-2xl  border border-gray-600 bg-gray-100 p-4 text-2xl  font-extrabold placeholder:text-sm placeholder:font-normal"
                  placeholder={
                    entered
                      ? 'You have already entered this round'
                      : 'The minimum amount to enter lottery is 0.1 NEAR'
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
              )}
            </div>
            <div className={`flex w-full items-center gap-10  ${signedIn ? 'pt-10' : 'pt-20'} `}>
              <button
                className={`${
                  !enterLotteryAvailable && signedIn ? 'cursor-not-allowed opacity-60' : ''
                }   w-full  items-center justify-between gap-2 rounded-2xl border-2 border-black p-4 py-4 text-2xl  font-extrabold   hover:opacity-60`}
                onClick={!signedIn ? handleSignIn : handleEnterLottery}
              >
                {!signedIn ? 'Sign In To Enter Lottery' : 'Enter Lottery'}
              </button>

              {signedIn && (
                <button
                  className={` w-full items-center justify-between gap-2 rounded-2xl border-2 border-black p-4 py-4 text-2xl  font-extrabold   hover:opacity-30`}
                  onClick={handleSignOut}
                >
                  {'Sign Out'}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-xl border-2 border-black bg-gray-200 bg-opacity-70 p-4 pb-2">
          <table className="max-h-max w-full min-w-[450px] rounded-2xl ">
            <thead>
              <tr className="rounded-tr-2xl">
                <th className="p-2 text-left text-2xl font-semibold">Player</th>
                <th className="p-2 text-left text-2xl font-semibold">Bet</th>
                <th className="p-2 text-left text-2xl font-semibold">Share</th>
              </tr>
            </thead>
            <tbody className="w-full">
              {bets &&
                bets.map((bet, index) => (
                  <tr className="whitespace-nowrap" key={index}>
                    <td className="relative flex items-center gap-2 p-2 text-2xl font-semibold">
                      <div
                        className="h-[50px] w-2"
                        style={{
                          background: COLORS[index % COLORS.length],
                        }}
                      />

                      {players && formateAccount(players[index])}
                    </td>
                    <td className="items-center gap-2 p-2 text-2xl font-semibold">
                      {Big(bet).div(Big(10).pow(24)).toFixed()}
                      <img
                        width={24}
                        height={24}
                        className="mb-1 ml-2 inline-block rounded-full border border-black"
                        src={NEAR_ICON}
                      />
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
        </div>
      </div>
    </div>
  )
}
