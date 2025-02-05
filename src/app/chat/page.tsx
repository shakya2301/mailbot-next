'use client'

import React from 'react'
import { sendHi } from './actions'
import { useSession } from 'next-auth/react'
import ChatSection from '@/components/ChatSection'

function ChatPage() {
  return (
    <div className='h-screen w-screen'>
      <ChatSection/>
    </div>
  )
}

export default ChatPage