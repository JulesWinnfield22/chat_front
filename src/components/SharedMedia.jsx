import {memo, useEffect, useRef, useMemo, useState} from 'react'
import Ripple from '@/components/Ripple/Ripple'
import Tabs from '@/components/Tabs/Tabs'

function Layout({ active, children }) {
  return (
    <div className={`${active ? 'z-20' : 'z-10'} absolute top-0 left-0  h-full bg-white w-full flex-1 overflow-y-auto`}>
      <div className={`w-full min-h-full flex flex-col justify-center items-center`}>
        {
          children
        }
      </div>
    </div>
  )
}

function NothingFound({text}) {
  return (
    <>
      <img src='/src/assets/img/feeling_blue.svg' className='max-w-full w-32 h-32' />
      <span className='text-sm mt-4'>no {text} founnd!</span>
    </>
  )
}

function Files({active}) {
  return (
    <Layout active={active}>
      <div>files</div>
      <NothingFound text='files' />
    </Layout>
  )
}

function Photos({active}) {
  return (
    <Layout active={active}>
      <div>photos</div>
      <NothingFound text='photos' />
    </Layout>
  )
}

function Music({active}) {
  return (
    <Layout active={active}>
      <div>music</div>
      <NothingFound text='music' />
    </Layout>
  )
}

function Gif({active}) {
  return (
    <Layout active={active}>
      <div>Gif</div>
      <NothingFound text='gifs' />
    </Layout>
  )
}


function SharedMedia({ className }) {
  const tabs = [
    {name: 'files', component: Files},
    {name: 'photos', component: Photos}, 
    {name: 'music', component: Music},
    {name: 'gif', component: Gif}
  ]

  function changeActive(name) {
    setActiveItem(name)
  }

  return (
    <div className={`bg-white border border-gray-800/40 rounded-md h-full min-h-[15rem] flex flex-1 w-full flex-col gap-1 ${className}`}>
      <p className='p-2 text-sm lg:text-base font-bold text-gray-900'>Shared Media</p>
      <Tabs tabs={tabs} />
    </div>
  )
}

export default memo(SharedMedia)