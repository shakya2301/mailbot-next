'use client'

import React from 'react'
import { sendHi } from './actions'

function ChatSection() {
  return (
    <div>
      <button
      onClick={() => {
        sendHi()
      }}
      >
        Click me
      </button>
    </div>
  )
}

export default ChatSection