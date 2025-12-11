import React, { useEffect, useState } from 'react'

import './ChatsContainer.scss'
// import profile_img from '../../../assets/profile.png'
import Chat from '../../../Components/Messages/Chat'
import { getCurrentUser } from '../../../utils/getCurrentUser'

export default function ChatsContainer({ convList, onSelectConversation }) {
  const currentUser = getCurrentUser();
  const currentRole = currentUser?.role;

  return (
    <div className='chats-container'>
      <div className="search-bar">
        <input type="text" placeholder='Type name...' />
      </div>
      <div className="chat-list">
        {
          convList.length === 0 ?
            <div className='chat-list-empty'>
              <img src="empty_ghost.gif" alt="" />
              Its Quiet<br/>in Here...
            </div>
            :
            convList.map(conv => (
              <Chat key={conv._id} role={currentRole} conv={conv} onSelectConversation={onSelectConversation} />
            ))
        }
      </div>
    </div>
  )
}
