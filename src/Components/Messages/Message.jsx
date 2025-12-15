import React, { useContext, useEffect, useState } from 'react'

import './Message.scss'
import { getCurrentUser } from '../../utils/getCurrentUser'
import { AuthContext } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';

export default function Message(props) {

  const [recpUserDetails, setRecpUserDetails] = useState([]);
  const { user } = useContext(AuthContext);
  const currentUser = getCurrentUser();
  const currentUserId = currentUser.id;
  const recpUserId = props.msg.senderId._id;
  const recpProfilePic = props.recpPrfPic;

  return (
    <div className={`message-box ${props.msg.senderId._id === currentUserId ? 'right' : 'left'}`}>
      <div className={`message-main ${props.msg.senderId._id === currentUserId ? 'right' : 'left'}`}>

        <div className="message-profile-image-container">
          {
            props.msg.senderId._id === currentUserId ?
            <img src={user.profilePic || '/user.png'} alt="" />
            :
            <img src={recpProfilePic || '/user.png'} alt="" />
          }
        </div>

        <div className={`message ${props.msg.senderId._id === currentUserId ? 'right' : 'left'}`}>
          <div className="message-head">
            {props.info}
          </div>
          <div className="message-content">
            <p>{props.msg.text}</p>
          </div>
        </div>

      </div>
    </div>
  )
}
