import React from 'react'

import './ChatWindow.scss'
import Message from '../../../Components/Messages/Message'

export default function ChatWindow() {
  return (
    <div className='chat-window'>
      <div className='messages-list'>
        <Message/>
      </div>
      <div className="input-box">
        <input type="text" />
        <button>Send</button>
      </div>
    </div>
  )
}
