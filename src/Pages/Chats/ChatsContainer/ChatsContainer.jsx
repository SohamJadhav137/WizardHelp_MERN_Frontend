import React from 'react'

import './ChatsContainer.scss'
// import profile_img from '../../../assets/profile.png'
import Chat from '../../../Components/Messages/Chat'

export default function ChatsContainer() {
  return (
    <div className='chats-container'>
      <div className="search-bar">
        <input type="text" placeholder='Type name...'/>
      </div>
      <div className="chat-list">
        <Chat/>
        <Chat/>
      </div>
    </div>
  )
}
