import React, { useEffect, useState } from 'react'

import './ChatsContainer.scss'
// import profile_img from '../../../assets/profile.png'
import Chat from '../../../Components/Messages/Chat'
import { getCurrentUser } from '../../../utils/getCurrentUser'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function ChatsContainer({ convList, searchQuery, setSearchQuery, onSelectConversation }) {
  const currentUser = getCurrentUser();
  const currentRole = currentUser?.role;

  return (
    <div className='chats-container'>
      <div className="chats-title">
        Messages
      </div>
      <div className="search-bar">
        <input type="text" placeholder='Type username...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <div className="chat-list">
        {
          convList.length === 0 ?
            <div className='chat-list-empty'>
              {/* <img src="empty_ghost.gif" alt="" /> */}
              {/* <div className="chat-list-empty-gif">
              <DotLottieReact
                src="https://lottie.host/fc62c3e2-73cb-45c9-8217-19a12ffe44a1/GzlNQuUcrn.lottie"
                loop
                autoplay
                />
                </div>
              Its Quiet<br />in Here... */}
              No chats found!
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
