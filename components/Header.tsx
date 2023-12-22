import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'

import Image from 'next/image'

const Header = () => {
  return (
    <div className="fixed left-0 top-0 flex w-screen items-center justify-center border-b  border-black border-opacity-30  bg-white shadow-xl">
      <header className="flex  items-center justify-between space-x-4  py-10 text-2xl leading-5   sm:space-x-6">
        <Link href="/" aria-label={siteMetadata.headerTitle}>
          <div className="flex items-center justify-between">
            <div className="mr-3">
              <Image src={'/transformer.png'} height={50} width={50} alt="transformer"></Image>
            </div>
            {typeof siteMetadata.headerTitle === 'string' ? (
              <div className="hidden h-6 text-2xl font-semibold sm:block">
                {siteMetadata.headerTitle}
              </div>
            ) : (
              siteMetadata.headerTitle
            )}
          </div>
        </Link>
        {headerNavLinks
          .filter((link) => link.href !== '/')
          .map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="hidden text-2xl font-medium text-gray-900 dark:text-gray-100 sm:block"
            >
              {link.title}
            </Link>
          ))}

        <Link
          href={'https://app.ref.finance/'}
          className="flex h-6 flex-shrink-0 items-center justify-center rounded-xl border border-black p-4 font-medium   hover:opacity-30"
        >
          Buy Now
        </Link>
      </header>
    </div>
  )
}

export default Header
