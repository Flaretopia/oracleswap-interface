import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/outline'
import { MenuItem, MenuItemLeaf, MenuItemNode } from 'app/components/Header/useMenu'
import Typography from 'app/components/Typography'
import { classNames } from 'app/functions'
import useDesktopMediaQuery, { useTouchDeviceMediaQuery } from 'app/hooks/useDesktopMediaQuery'
import { useDexWarningOpen } from 'app/state/application/hooks'
import { useRouter } from 'next/router'
import React, { FC, Fragment, useCallback, useRef } from 'react'

interface NavigationItem {
  node: MenuItem
}

export const NavigationItem: FC<NavigationItem> = ({ node }) => {
  const router = useRouter()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isDesktop = useDesktopMediaQuery()
  const touchDevice = useTouchDeviceMediaQuery()

  const showUseDexWarning = useDexWarningOpen()

  const handleToggle = useCallback((open, type) => {
    if (!open && type === 'enter') {
      buttonRef?.current?.click()
    } else if (open && type === 'leave') {
      buttonRef?.current?.click()
    }
  }, [])

  if (node && node.hasOwnProperty('link')) {
    const { link, external } = node as MenuItemLeaf
    if (external) {
      return (
        <Typography
          weight={700}
          variant="sm"
          className={classNames(
            router.asPath === link ? 'text-primary' : '',
            'hover:text-[#cba135] font-bold py-5 px-2 rounded flex gap-3'
          )}
        >
          <a href={link} target="_blank" rel="noreferrer">
            <div className="flex flex-row">
              {!isDesktop && node.icon}
              <div className={classNames(!isDesktop && 'ml-3')}>{node.title}</div>
            </div>
          </a>
        </Typography>
      )
    }
    return (
      <Typography
        onClick={() => router.push(link)}
        weight={700}
        variant="sm"
        className={classNames(
          router.asPath === link ? 'text-primary' : '',
          'hover:text-[#cba135] font-bold py-5 px-2 rounded flex gap-3'
        )}
      >
        {!isDesktop && node.icon}
        {node.title}
      </Typography>
    )
  }

  return (
    <Popover key={node.key} className="relative flex">
      {({ open }) => (
        <div
          {...(!touchDevice && {
            onMouseEnter: () => handleToggle(open, 'enter'),
            onMouseLeave: () => handleToggle(open, 'leave'),
          })}
        >
          <Popover.Button ref={buttonRef}>
            <Typography
              weight={700}
              variant="sm"
              className={classNames(open ? 'text-primary' : '', 'font-bold py-5 px-2 rounded flex gap-3 items-center hover:text-[#cba135]')}
            >
              {!isDesktop && node.icon}
              {node.title}
              <ChevronDownIcon strokeWidth={5} width={12} />
            </Typography>
          </Popover.Button>
          {node.hasOwnProperty('items') && (
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Popover.Panel className="z-10 w-full absolute w-40 translate-y-[-8px] translate-x-[-8px]">
                <div
                  className={classNames(
                    'shadow-md shadow-black/40 border border-dark-700 rounded overflow-hidden',
                    !touchDevice
                      ? "backdrop-blur-fallback before:z-[-1] before:rounded before:absolute before:w-full before:h-full before:content-['']  bg-white bg-opacity-[0.02]"
                      : 'bg-dark-800 inset-0',
                      showUseDexWarning ? 'before:backdrop-blur-[40px]' : 'before:backdrop-blur-[20px]'
                  )}
                >
                  {(node as MenuItemNode).items.map((leaf) => (
                    <Typography
                      variant="sm"
                      weight={700}
                      key={leaf.key}
                      onClick={() => {
                        router.push(leaf.link).then(() => buttonRef?.current?.click())
                      }}
                      className="relative px-3 py-2 m-1 rounded-lg hover:cursor-pointer hover:text-[#cba135]"
                    >
                      {leaf.title}
                    </Typography>
                  ))}
                </div>
              </Popover.Panel>
            </Transition>
          )}
        </div>
      )}
    </Popover>
  )
}
