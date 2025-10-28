import React from 'react'

import './Chat.scss'
import profile_img from '../../assets/profile.png'

export default function Chat() {
  return (
    <div>
        <div className="chat">
          <div className="chat-profile-photo">
            <div className="chat-profile-photo-container">
              <img src={profile_img} alt="" />
            </div>
          </div>
          <div className="chat-name">
            <span>Alex</span>
          </div>
        </div>
    </div>
  )
}
