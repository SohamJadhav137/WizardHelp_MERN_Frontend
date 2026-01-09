import React, { useEffect, useState } from 'react'

import './Chat.scss'
import profile_img from '../../assets/profile.png'
import { getCurrentUser } from '../../utils/getCurrentUser'
import { formatChatTimestamp } from '../../utils/formatChatTimestamp';

export default function Chat({ role, conv, onSelectConversation }) {

  const [recipientDetails, setrecipientDetails] = useState([]);
  
  const token = localStorage.getItem("token");
  const date = new Date(conv.updatedAt);
  const formattedTime = date.toLocaleTimeString('en-us', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  let recipientId;
  if(role === 'buyer'){
    recipientId = conv?.sellerId._id;
  }
  else if(role === 'seller'){
    recipientId = conv?.buyerId._id;
  }

  // Fetch recipient details
  useEffect(() => {
    const fetchRecipientDetails = async () => {
      try{
        const res = await fetch(`http://localhost:5000/api/user/${recipientId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if(res.ok){
          const data = await res.json();
          setrecipientDetails(data.user);
        }
        else{
          console.error("Failed to fetch recipient details:", res.status);
        }
      } catch(error){
        console.error("Some error occured:", error);
      }
    };

    fetchRecipientDetails();
  }, [recipientId]);

  // Last msg socket display
  // useEffect(() => {
  //   if(!socket) return;
    
  //   const handleSocketEvent = (payload) => {
  //     console.log("Socket exec!")
  //     setLastMsg(payload.lastMsg);
  //   }

  //   socket.on("lastMsgReceived", handleSocketEvent);

  //   return () => {
  //     socket.off("lastMsgReceived", handleSocketEvent);
  //   }

  // }, [socket]);

  return (
    <div className="chat" onClick={() => onSelectConversation(conv._id)}>

      <div className="chat-profile-photo">
        <div className="chat-profile-photo-container">
          <img src={recipientDetails?.profilePic || '/user.png'} alt="" />
        </div>
      </div>

      <div className="chat-info">
        <div className="chat-name">
          {
            role === 'buyer' ?
              <div>{conv.sellerName}</div>
              :
              <div>{conv.buyerName}</div>
          }
          <div className='last-msg-sent'>{formatChatTimestamp(conv.updatedAt)}</div>
          
        </div>
        <div className="chat-last-message">
          <span>{conv.lastMessage}</span>
        </div>
      </div>
    </div>
  )
}
