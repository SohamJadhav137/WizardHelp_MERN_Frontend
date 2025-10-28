import React from 'react'

import './MainContainer.scss'
import ChatsContainer from '../ChatsContainer/ChatsContainer'
import ChatWindow from '../ChatWindow/ChatWindow'

export default function MainContainer() {
  return (
    <div className='chat-app'>
      {/* <div className="messages-website-title">
        <div className="messages-website-title-container">
        <span>Messages</span>
        </div>
      </div> */}
      <div className='chat-app-container'>
      <ChatsContainer/>
      <ChatWindow/>
      </div>
    </div>
  )
}
