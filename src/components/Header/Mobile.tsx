import { Dialog, Transition } from '@headlessui/react'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import { NATIVE } from '@oracleswap/core-sdk'
import useMenu from 'app/components/Header/useMenu'
import Web3Network from 'app/components/Web3Network'
import Web3Status from 'app/components/Web3Status'
import useIsCoinbaseWallet from 'app/hooks/useIsCoinbaseWallet'
import { useActiveWeb3React } from 'app/services/web3'
import { useDexWarningOpen, useToggleDexWarning } from 'app/state/application/hooks'
import { useETHBalances } from 'app/state/wallet/hooks'
// import Image from 'next/image'
import Link from 'next/link'
import React, { FC, Fragment, useState } from 'react'
import LogoImage from '../../../public/icons/icon-72x72.png'
import { NavigationItem } from './NavigationItem'
// import { XIcon } from '@heroicons/react/outline'
// import Typography from 'app/components/Typography'
import ExternalLink from '../ExternalLink'
import Typography from 'app/components/Typography'

const Mobile: FC = () => {
  const menu = useMenu()
  const { account, chainId, library } = useActiveWeb3React()
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const [open, setOpen] = useState(false)
  const isCoinbaseWallet = useIsCoinbaseWallet()

  const toggleWarning = useToggleDexWarning()
  const showUseDexWarning = useDexWarningOpen()

  return (
    <>
      {showUseDexWarning && (
        <div className="py-2 text-[1rem] text-white bg-[#e62058] relative text-center rounded-b-lg mx-4">
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div
              className="flex items-center justify-center w-6 h-6 cursor-pointer hover:text-white/80"
              onClick={toggleWarning}
            >
              <XIcon width={24} height={24} className="text-white" />
            </div>
          </div>
          <Typography variant="xs" weight={700} className="text-[1rem] text-white">
            OracleSwap is being rebranded to <a href="https://owlswap.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80">OwlSwap</a> by <a href="https://flaretopia.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80">Flaretopia</a>!
          </Typography>
          <Typography variant="xs" weight={700} className="text-[1rem] text-white">
           🔥 THE BURN MIGRATION EXCHANGE IS NOW LIVE <a href="https://docs.flaretopia.com/flaretopia/tge" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80">LEARN MORE!</a>
          </Typography>
        </div>
      )}
      <header className="w-full flex items-center justify-between min-h-[64px] h-[64px] px-4">
        <div className="flex justify-between flex-grow">
          <div className="p-2 rounded-full hover:bg-white/10">
            <MenuIcon width={28} className="text-black cursor-pointer hover:text-[#cba135]" onClick={() => setOpen(true)} />
          </div>
          <div className="flex items-center mr-1">
            <ExternalLink href="https://www.flaretopia.com/">
              <img src={LogoImage.src} className={'w-[40px] h-[40px]'} alt="Logo" />
            </ExternalLink>
          </div>
        </div>
        <Transition.Root show={open} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-20 overflow-hidden" onClose={setOpen}>
            <div className="absolute inset-0 overflow-hidden">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="absolute inset-0 transition-opacity bg-dark-1000 bg-opacity-80" />
              </Transition.Child>

              <div className="fixed inset-y-0 left-0 pr-10 max-w-[260px] flex">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-[-100%]"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-[-100%]"
                >
                  <div className="w-screen max-w-sm">
                    <div className="flex flex-col h-full py-6 overflow-x-hidden overflow-y-scroll shadow-xl bg-dark-800">
                      <nav className="flex-1 pl-6" aria-label="Sidebar">
                        {menu.map((node) => {
                          return <NavigationItem node={node} key={node.key} />
                        })}
                      </nav>

                      <div className="flex flex-col gap-4 px-6">
                        {library && (library.provider.isMetaMask || isCoinbaseWallet) && (
                          <div className="hidden sm:flex">
                            <Web3Network />
                          </div>
                        )}

                        <div className="flex items-center justify-start gap-2">
                          <div className="flex items-center w-auto text-sm font-bold border-2 rounded shadow cursor-pointer pointer-events-auto select-none border-dark-800 hover:border-dark-700 bg-dark-900 whitespace-nowrap">
                            {account && chainId && userEthBalance && (
                              <Link href="/portfolio" passHref={true}>
                                <a className="hidden px-3 text-high-emphesis text-bold md:block">
                                  {/*@ts-ignore*/}
                                  {userEthBalance?.toSignificant(4)} {NATIVE[chainId || 1].symbol}
                                </a>
                              </Link>
                            )}
                            <Web3Status />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </header>
    </>
  )
}

export default Mobile
