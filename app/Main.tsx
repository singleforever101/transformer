'use client'

import Image from 'next/image'

import transformer from 'public/transformer.png'

import twitter from 'public/twitter.png'

import Link from 'next/link'

import tranformerFull from 'public/transformer-full.png'

import money from 'public/money.png'
import MintButton from '@/components/MintButton'

const refIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='16 24 248 248' style='background: %23000'%3E%3Cpath d='M164,164v52h52Zm-45-45,20.4,20.4,20.6-20.6V81H119Zm0,18.39V216h41V137.19l-20.6,20.6ZM166.5,81H164v33.81l26.16-26.17A40.29,40.29,0,0,0,166.5,81ZM72,153.19V216h43V133.4l-11.6-11.61Zm0-18.38,31.4-31.4L115,115V81H72ZM207,121.5h0a40.29,40.29,0,0,0-7.64-23.66L164,133.19V162h2.5A40.5,40.5,0,0,0,207,121.5Z' fill='%23fff'/%3E%3Cpath d='M189 72l27 27V72h-27z' fill='%2300c08b'/%3E%3C/svg%3E%0A"

function Seperator() {
  return <div className=" my-10 h-4 w-full bg-black bg-opacity-80 "></div>
}

function Introduce() {
  return (
    <div
      id="home"
      className="flex  items-center justify-between space-x-4  py-10 text-2xl leading-5"
    >
      <div className="flex flex-col items-start">
        <div className="text-5xl font-extrabold italic">$TRMR</div>

        <div className="max-w-lg pt-10 leading-10 ">
          the most memeable memecoin in existence. The dogs have had their day, it’s time for
          Transformer to take reign.
        </div>

        <div className="flex max-w-xl items-center gap-6 py-10 ">
          <Link href={'https://twitter.com/trmr_near'} target="_blank">
            <Image src={twitter} width={50} height={50} alt="twitter"></Image>
          </Link>
        </div>

        <Link
          href={'https://app.ref.finance/'}
          target="_blank"
          className=" flex max-w-max flex-shrink-0 items-center justify-between gap-2 rounded-2xl border border-black p-4 py-4  font-medium   hover:opacity-30"
        >
          <span>Ref Finance</span>

          <img src={refIcon} height={30} width={30} alt="ref-finance"></img>
        </Link>
      </div>

      <Image src={transformer} height={350} width={350} alt="transformer"></Image>
    </div>
  )
}

function About() {
  return (
    <div
      id="about"
      className="flex items-start justify-between space-x-4  py-10 text-2xl leading-5"
    >
      <Image src={tranformerFull} height={350} width={350} alt="transformer"></Image>

      <div className="flex flex-col items-start">
        <div className="justify-self-center pl-5 text-6xl font-black ">ABOUT</div>
        <div className="max-w-xl pt-10 leading-10 ">
          Transformer is tired of watching everyone play hot potato with the endless derivative
          ShibaCumGMElonKishuTurboAssFlokiMoon Inu coins. The Inu’s have had their day. It’s time
          for the most recognizable meme in the world to take his reign as king of the memes.
        </div>

        <div className="max-w-xl pt-10 leading-10 ">
          Transformer is here to make memecoins great again. Launched stealth with no presale, zero
          taxes, LP burnt and contract renounced, $TRMR is a coin for the people, forever. Fueled by
          pure memetic power, let $TRMR show you the way.
        </div>
      </div>
    </div>
  )
}

function HowToBuy() {
  return (
    <div className="flex items-start justify-center space-x-4  py-10 text-2xl leading-5">
      <div className="flex w-full flex-col items-center gap-10">
        <div className="text-6xl font-black">HOW TO BUY</div>

        <div className="flex w-full items-center justify-between gap-10 rounded-2xl border-4 border-black border-opacity-70 p-5 pl-20 text-2xl text-black">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
          >
            <path
              d="M61.9 55.8839V28.184C61.9 22.664 56.2999 17.254 49.3799 17.254C45.6605 17.3188 42.1114 18.8245 39.48 21.454L26.99 9.12395C30.3087 5.89418 34.2851 3.41825 38.6478 1.86507C43.0105 0.311895 47.6569 -0.281984 52.27 0.123952C68.51 1.66395 79.21 14.8139 79.21 28.5739V73.574L61.9 55.8839Z"
              fill="url(#paint0_linear_528_13380.i294k2ddaug)"
            ></path>
            <path
              d="M0 17.5439V62.5439C0 76.3039 10.71 89.4539 26.94 90.9939C31.5531 91.3999 36.1995 90.806 40.5622 89.2528C44.9249 87.6996 48.9013 85.2237 52.22 81.9939L39.73 69.6639C37.0986 72.2934 33.5495 73.7991 29.83 73.864C22.91 73.864 17.31 68.4539 17.31 62.9339V35.4339"
              fill="url(#paint1_linear_528_13380.i294k2ddaug)"
            ></path>
            <path
              d="M46.6998 40.734L79.1898 73.314V82.314C79.1898 85.264 76.2698 88.374 72.7598 88.434C70.7598 88.434 68.6698 86.864 67.3698 85.564L34.2998 52.324L0.00976562 17.824V8.82397C0.00976562 5.87397 2.92976 2.76398 6.43976 2.70398C8.43976 2.70398 10.5298 4.27397 11.8298 5.57397L46.6998 40.734Z"
              fill="url(#paint2_linear_528_13380.i294k2ddaug)"
            ></path>
            <defs>
              <linearGradient
                id="paint0_linear_528_13380.i294k2ddaug"
                x1="34.86"
                y1="-0.966047"
                x2="92.49"
                y2="59.8839"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.06" stop-color="#B6D7FE"></stop>
                <stop offset="0.12" stop-color="#A6D4FC"></stop>
                <stop offset="0.26" stop-color="#88CEF8"></stop>
                <stop offset="0.38" stop-color="#76CAF6"></stop>
                <stop offset="0.47" stop-color="#70C9F5"></stop>
                <stop offset="0.73" stop-color="#18A0EC"></stop>
              </linearGradient>
              <linearGradient
                id="paint1_linear_528_13380.i294k2ddaug"
                x1="5.22001"
                y1="25.4239"
                x2="39.48"
                y2="106.744"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.01" stop-color="#8537FF"></stop>
                <stop offset="0.49" stop-color="#D095FE"></stop>
                <stop offset="0.72" stop-color="#E9ADFF"></stop>
                <stop offset="0.85" stop-color="#F8BCFF"></stop>
              </linearGradient>
              <linearGradient
                id="paint2_linear_528_13380.i294k2ddaug"
                x1="82.2798"
                y1="87.254"
                x2="1.80976"
                y2="8.70399"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#35D7FD"></stop>
                <stop offset="0.68" stop-color="#9A68FE"></stop>
                <stop offset="1" stop-color="#B45DFF"></stop>
              </linearGradient>
            </defs>
          </svg>

          <div className="flex flex-col">
            <div className="text-4xl font-black">Create a Wallet</div>
            <div className="max-w-2xl pt-10 leading-10 ">
              Go to mynearwallet.near to Create a Wallet. You will need to create a username and
              deposit some $NEAR into your wallet to pay for transaction fees.
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-10 rounded-2xl border-4 border-black border-opacity-70 p-5 pl-20 text-2xl text-black">
          <img src={refIcon} height={100} width={100} alt="ref-finance"></img>

          <div className="flex flex-col">
            <div className="text-4xl font-black">Go to Ref Finance</div>
            <div className="max-w-2xl pt-10 leading-10 ">
              connect to Ref Finance. Go to https://app.ref.finance/ and connect your wallet. Paste
              and add the $TRMR token address into Ref Finance, select TRMR, and confirm.
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-10 rounded-2xl border-4 border-black border-opacity-70 p-5 pl-20 text-2xl text-black">
          <Image src={money} height={100} width={100} alt="money"></Image>

          <div className="flex flex-col">
            <div className="text-4xl font-black">Switch USDT for $TRMR</div>
            <div className="max-w-2xl pt-10 leading-10 ">
              switch USDC for $TRMR. We have ZERO taxes so you don’t need to worry about buying with
              a specific slippage, although you may need to use slippage during times of market
              volatility.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Tokenomics() {
  return (
    <div
      id="tokenomics"
      className="flex items-start justify-center space-x-4  py-10 text-2xl leading-5"
    >
      <div className="flex w-full flex-col items-center justify-between gap-10">
        <div className="text-6xl font-black">TOKENOMICS</div>

        <div className="flex w-full items-center">
          <div className="flex w-full flex-col items-start  gap-2">
            <div className="whitespace-nowrap text-2xl font-semibold">
              Token Supply: 1,000,000,000
            </div>

            <div className="whitespace-nowrap text-2xl font-semibold">Free Mint: 100,000,000</div>

            <div className="whitespace-nowrap text-2xl font-semibold">LP burn: 800,000,000</div>

            <div className="whitespace-nowrap text-2xl font-semibold">
              Team and future developer: 50,000,000
            </div>

            <div className="whitespace-nowrap text-2xl font-semibold">
              Incentive for exchange: 50,000,000
            </div>

            <div className="mt-10 flex w-full max-w-xl items-center justify-between gap-10 rounded-2xl border-4 border-black border-opacity-70 p-5  text-2xl text-black">
              No Taxes, No Bullshit. It’s that simple. LP tokens are burnt, and contract ownership
              is renounced.
            </div>
          </div>

          <Image src={transformer} height={350} width={350} alt="transformer"></Image>
        </div>
      </div>
    </div>
  )
}

function RoadMap() {
  return (
    <div
      id="roadmap"
      className="flex items-start justify-center space-x-4  py-10 text-2xl leading-5"
    >
      <div className="flex w-full flex-col items-center justify-between gap-10">
        <div className="text-6xl font-black">ROADMAP</div>

        <div className="flex w-full flex-col items-center justify-center  gap-2">
          <div className="mt-7 flex w-full max-w-lg flex-col items-center justify-between gap-6 rounded-2xl border-4 border-black border-opacity-70 p-5  text-2xl text-black">
            <div>Phase 1: Meme Phase</div>
            <div>Phase 2: Vibe and HODL</div>

            <div>Phase 3: Meme Takeover</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Contact() {
  return (
    <div className="flex items-start justify-center space-x-4  py-10 text-2xl leading-5">
      <div className="flex w-full flex-col items-center justify-between gap-10">
        <div className="text-6xl font-black">CONTACT</div>

        <div className="flex items-center gap-2">
          <Image src={transformer} height={60} width={60} alt="transformer"></Image>

          <div className="text-4xl font-black"> Transformer </div>
        </div>

        <div className="flex items-center gap-10">
          <Link href={'https://twitter.com/trmr_near'} target="_blank">
            <Image src={twitter} height={60} width={60} alt="twitter"></Image>
          </Link>
        </div>

        <div className="max-w-xl text-lg  leading-8">
          $TRMR token is simply paying homage to a meme we all love and recognize.
        </div>

        <div className="max-w-xl text-lg leading-8">
          $TRMR is a meme coin with no intrinsic value or expectation of financial return. There is
          no formal team or roadmap. the coin is completely useless and for entertainment purposes
          only.
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <div className="divide-y divide-gray-200 pt-40 dark:divide-gray-700">
        <MintButton />
        <Introduce />

        <Seperator></Seperator>

        <About />

        <Seperator></Seperator>

        <HowToBuy />
        <Seperator></Seperator>

        <Tokenomics></Tokenomics>

        <Seperator></Seperator>

        <RoadMap></RoadMap>

        <Seperator></Seperator>

        <Contact></Contact>
      </div>
    </>
  )
}
