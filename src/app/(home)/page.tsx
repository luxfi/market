import React from 'react'

import { TouchDevice } from './scroll-snap'
import { Header } from '@luxfi/ui'

import siteDef from '@/site-def'

const Page = () => {
  // For static export, default to mobile-first responsive design
  return (<>
    <Header siteDef={siteDef}/>
    <TouchDevice isTablet={false} />
  </>)
}

export default Page
