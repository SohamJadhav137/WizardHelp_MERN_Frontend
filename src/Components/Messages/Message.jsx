import React from 'react'

import './Message.scss'

export default function Message(props) {
  return (
    <div className='message-box'>
        <div className="message-profile-image-container">a</div>
        <div className="message">
            <p>{props.msg}</p>
        </div>
    </div>
  )
}
